import { getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, limit, deleteDoc, getDoc } from '@react-native-firebase/firestore';
import { ChatMessage, chatMessageConverter } from '../../models/Chat';

class ChatService {
  /**
   * Listen to messages for a specific network
   */
  subscribeToMessages(networkId: string, onUpdate: (messages: ChatMessage[]) => void) {
    const db = getFirestore();
    const messagesRef = collection(db, 'networkChats', networkId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          senderUid: data.senderUid,
          text: data.text,
          timestamp: data.timestamp,
          replyTo: data.replyTo || null,
          reactions: data.reactions || {}
        } as ChatMessage);
      });
      onUpdate(messages);
    }, (error) => {
      console.error('Chat subscription error:', error);
    });
  }

  /**
   * Send a new message
   */
  async sendMessage(networkId: string, senderUid: string, text: string, replyTo: ChatMessage['replyTo'] = null) {
    const db = getFirestore();
    const messagesRef = collection(db, 'networkChats', networkId, 'messages');
    
    await addDoc(messagesRef, {
      senderUid,
      text,
      timestamp: Date.now(),
      replyTo,
      reactions: {}
    });
  }

  /**
   * Add or remove a reaction
   */
  async toggleReaction(networkId: string, messageId: string, userUid: string, emoji: string) {
    const db = getFirestore();
    const { deleteField } = require('@react-native-firebase/firestore');
    const msgRef = doc(db, 'networkChats', networkId, 'messages', messageId);
    
    const snap = await getDoc(msgRef);
    const isExisting = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
    if (isExisting) {
      const data = snap.data();
      if (!data) return;
      const currentReactions = data.reactions || {};
      
      if (currentReactions[userUid] === emoji) {
        // Remove it
        await updateDoc(msgRef, {
          [`reactions.${userUid}`]: deleteField()
        });
      } else {
        // Add/update it
        await updateDoc(msgRef, {
          [`reactions.${userUid}`]: emoji
        });
      }
    }
  }
}

export const chatService = new ChatService();
