import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { chatService } from '../services/chat/ChatService';
import { ChatMessage } from '../models/Chat';
import { Send, Smile, X, Reply } from 'lucide-react-native';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { Modal, TouchableWithoutFeedback } from 'react-native';

export const ChatScreen = () => {
  const { user } = useAuthStore();
  const { activeNetwork } = useNetworkStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<ChatMessage['replyTo']>(null);
  
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const [selectedMessage, setSelectedMessage] = useState<{ msg: ChatMessage, y: number } | null>(null);
  const touchY = useRef(0);

  useEffect(() => {
    if (!activeNetwork?.networkId) return;
    const unsubscribe = chatService.subscribeToMessages(activeNetwork.networkId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      
      // Fetch missing names
      const missingUids = new Set<string>();
      newMessages.forEach(msg => {
        if (!userNames[msg.senderUid]) missingUids.add(msg.senderUid);
      });
      
      missingUids.forEach(uid => {
        const db = getFirestore();
        getDoc(doc(db, 'users', uid)).then(snap => {
          const isExisting = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
          if (isExisting) {
            setUserNames(prev => ({ ...prev, [uid]: snap.data()?.displayName || 'Unknown' }));
          }
        });
      });
    });

    return () => unsubscribe();
  }, [activeNetwork?.networkId]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeNetwork?.networkId || !user?.firebaseUid) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    
    try {
      await chatService.sendMessage(activeNetwork.networkId, user.firebaseUid, textToSend, replyingTo);
      setReplyingTo(null);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const handleLongPress = (msg: ChatMessage, y: number) => {
    setSelectedMessage({ msg, y });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderUid === user?.firebaseUid;
    const senderName = isMe ? 'You' : (userNames[item.senderUid] || '...');

    // Combine reactions
    const reactionCounts: Record<string, number> = {};
    Object.values(item.reactions || {}).forEach(emoji => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });

    return (
      <TouchableOpacity 
        onPressIn={(e) => { touchY.current = e.nativeEvent.pageY; }}
        onLongPress={() => handleLongPress(item, touchY.current)}
        activeOpacity={0.8}
        style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}
      >
        {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
        
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          {item.replyTo && (
            <View style={styles.replyBubble}>
              <Text style={styles.replyName}>{item.replyTo.senderUid === user?.firebaseUid ? 'You' : (userNames[item.replyTo.senderUid] || 'Someone')}</Text>
              <Text style={styles.replyText} numberOfLines={1}>{item.replyTo.text}</Text>
            </View>
          )}
          
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>{item.text}</Text>
          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {Object.keys(reactionCounts).length > 0 && (
          <View style={[styles.reactionsContainer, isMe ? styles.reactionsContainerMe : styles.reactionsContainerOther]}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <View key={emoji} style={styles.reactionBadge}>
                <Text style={styles.reactionBadgeText}>{emoji} {count > 1 ? count : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!activeNetwork) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text.secondary }}>No network selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal visible={!!selectedMessage} transparent animationType="fade" onRequestClose={() => setSelectedMessage(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedMessage(null)}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { position: 'absolute', top: selectedMessage?.y ? Math.min(selectedMessage.y - 80, 600) : '40%' }]}>
              <View style={styles.reactionRow}>
                {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                  <TouchableOpacity 
                    key={emoji}
                    style={styles.reactionBtn}
                    onPress={() => {
                      if (selectedMessage && user?.firebaseUid) {
                        chatService.toggleReaction(activeNetwork.networkId, selectedMessage.msg.id, user.firebaseUid, emoji);
                      }
                      setSelectedMessage(null);
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.replyActionBtn}
                onPress={() => {
                  if (selectedMessage) {
                    setReplyingTo({
                      messageId: selectedMessage.msg.id,
                      text: selectedMessage.msg.text,
                      senderUid: selectedMessage.msg.senderUid
                    });
                  }
                  setSelectedMessage(null);
                }}
              >
                <Reply color={colors.secondary} size={20} />
                <Text style={styles.replyActionText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={styles.listContent}
          />
        )}

        {replyingTo && (
          <View style={styles.replyPreviewBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.replyPreviewName}>
                Replying to {replyingTo.senderUid === user?.firebaseUid ? 'yourself' : (userNames[replyingTo.senderUid] || 'Someone')}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>{replyingTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 4 }}>
              <X color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.secondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextOther: {
    color: colors.text.primary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeTextOther: {
    color: colors.text.secondary,
  },
  replyBubble: {
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  replyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: -8,
    zIndex: 10,
    elevation: 2,
  },
  reactionsContainerMe: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  reactionsContainerOther: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  reactionBadge: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 4,
  },
  reactionBadgeText: {
    fontSize: 12,
  },
  inputContainer: {
    paddingTop: 2,
    padding: 12,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: colors.text.primary,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  reactionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  replyPreviewBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  replyPreviewText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },
  replyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  replyActionText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});
