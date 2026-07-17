import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, setDoc, deleteDoc, getDocs } from '@react-native-firebase/firestore';
import { EcosystemNetwork, EcosystemUser } from '../models/Ecosystem';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';
import { ArrowLeft, Plus, Users, Key, LogIn, Edit2, Trash2, Clock, LogOut } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NotificationService from '../services/NotificationService';

export const ManageNetworksScreen = () => {
  const { user } = useAuthStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation<any>();
  const { setActiveNetwork } = useNetworkStore();

  const [networks, setNetworks] = useState<Record<string, EcosystemNetwork>>({});
  const [ecosystemUsers, setEcosystemUsers] = useState<Record<string, EcosystemUser & { displayName?: string, userId: string }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedEcosystemCode, setSelectedEcosystemCode] = useState<string>(
    user?.ecosystemCode || (user?.ecosystems?.length ? user.ecosystems[0] : '')
  );
  const [inviteModalNetworkId, setInviteModalNetworkId] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    customContent?: React.ReactNode;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const closeModal = () => setModalConfig(prev => ({ ...prev, visible: false }));

  const currentRole = ecosystemUsers[user?.userId || '']?.role || 'User';
  const isEcosystemAdmin = currentRole === 'SuperAdmin' || currentRole === 'Admin';

  useFocusEffect(
    useCallback(() => {
      fetchEcosystemData();
    }, [user, selectedEcosystemCode])
  );

  const fetchEcosystemData = async () => {
    if (!selectedEcosystemCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setNetworks({});
    setEcosystemUsers({});
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      const ecoSnap = await getDoc(ecoRef);
      const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;

      if (isExisting) {
        const ecoData = ecoSnap.data();
        setNetworks(ecoData?.networks || {});

        const usersMap = ecoData?.users || {};
        const populatedUsers: Record<string, EcosystemUser & { displayName?: string, userId: string }> = {};
        for (const [uid, u] of Object.entries(usersMap)) {
          const ecoUser = u as EcosystemUser;
          let displayName = 'Unknown User';
          try {
            const userRef = doc(db, 'users', ecoUser.firebaseUid);
            const userSnap = await getDoc(userRef);
            const isUserExisting = typeof userSnap.exists === 'function' ? userSnap.exists() : userSnap.exists;
            if (isUserExisting) {
              displayName = userSnap.data()?.displayName || 'Unknown User';
            }
          } catch (e) {
            console.warn('Failed to fetch name', e);
          }
          populatedUsers[uid] = { ...ecoUser, displayName, userId: uid };
        }
        setEcosystemUsers(populatedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch ecosystem networks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNetwork = async (networkName: string, networkDescription: string) => {
    if (!selectedEcosystemCode || !networkName.trim() || !user) return;
    closeModal();
    setLoading(true);
    try {
      const networkId = 'NET-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const newNetwork: EcosystemNetwork = {
        name: networkName,
        description: networkDescription,
        createdAt: Date.now(),
      };

      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      await updateDoc(ecoRef, {
        [`networks.${networkId}`]: newNetwork
      });

      // SuperAdmins/Admins are implicitly in it, but let's add it to their networks array for consistency
      const updates: any = {};
      const chatAllowedUids: string[] = [];
      Object.values(ecosystemUsers).forEach(u => {
        if (u.role === 'SuperAdmin' || u.role === 'Admin' || u.userId === user.userId) {
          updates[`users.${u.userId}.networks`] = [...(u.networks || []), networkId];
          chatAllowedUids.push(u.firebaseUid);
        }
      });
      await updateDoc(ecoRef, updates);

      // Initialize the NetworkChat document
      const chatRef = doc(db, 'networkChats', networkId);
      await setDoc(chatRef, {
        networkId,
        ecosystemCode: selectedEcosystemCode,
        allowedUids: chatAllowedUids,
        createdAt: Date.now()
      });

      await fetchEcosystemData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showCreateNetworkModal = () => {
    let newNetworkName = '';
    let newNetworkDescription = '';
    setModalConfig({
      visible: true,
      title: 'Create New Network',
      message: 'Enter details for the new network:',
      customContent: (
        <View style={{ width: '100%' }}>
          <TextInput
            style={[styles.input, { marginTop: 12, width: '100%' }]}
            placeholder="Network Name"
            placeholderTextColor={colors.text.secondary}
            onChangeText={(text) => { newNetworkName = text; }}
            autoFocus
          />
          <TextInput
            style={[styles.input, { marginTop: 12, width: '100%' }]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.text.secondary}
            onChangeText={(text) => { newNetworkDescription = text; }}
          />
        </View>
      ),
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: 'Create', onPress: () => handleCreateNetwork(newNetworkName, newNetworkDescription), variant: 'primary' }
      ]
    });
  };

  const handleEditNetwork = async (networkId: string, newName: string, newDesc: string) => {
    if (!selectedEcosystemCode || !newName.trim()) return;
    closeModal();
    setLoading(true);
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      await updateDoc(ecoRef, {
        [`networks.${networkId}.name`]: newName,
        [`networks.${networkId}.description`]: newDesc,
      });
      await fetchEcosystemData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showEditNetworkModal = (networkId: string, currentName: string, currentDesc: string = '') => {
    let editName = currentName;
    let editDesc = currentDesc;
    setModalConfig({
      visible: true,
      title: 'Edit Network',
      message: 'Update details for this network:',
      customContent: (
        <View style={{ width: '100%' }}>
          <TextInput
            style={[styles.input, { marginTop: 12, width: '100%' }]}
            placeholder="Network Name"
            placeholderTextColor={colors.text.secondary}
            defaultValue={currentName}
            onChangeText={(text) => { editName = text; }}
          />
          <TextInput
            style={[styles.input, { marginTop: 12, width: '100%' }]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.text.secondary}
            defaultValue={currentDesc}
            onChangeText={(text) => { editDesc = text; }}
          />
        </View>
      ),
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: 'Save', onPress: () => handleEditNetwork(networkId, editName, editDesc), variant: 'primary' }
      ]
    });
  };

  const handleDeleteNetwork = async (networkId: string) => {
    if (!selectedEcosystemCode) return;
    closeModal();
    setLoading(true);
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      const ecoSnap = await getDoc(ecoRef);
      const data = ecoSnap.data();
      const updates: any = {};
      if (data && data.networks) {
        const updatedNetworks = { ...data.networks };
        delete updatedNetworks[networkId];
        updates.networks = updatedNetworks;
      }
      
      if (data && data.users) {
        Object.keys(data.users).forEach(uid => {
          if (data.users[uid].networks && data.users[uid].networks.includes(networkId)) {
            updates[`users.${uid}.networks`] = data.users[uid].networks.filter((n: string) => n !== networkId);
          }
        });
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(ecoRef, updates);
      }
      
      try {
        const messagesRef = collection(db, 'networkChats', networkId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        const deletePromises: Promise<void>[] = [];
        messagesSnap.forEach((msgDoc) => {
          deletePromises.push(deleteDoc(msgDoc.ref));
        });
        await Promise.all(deletePromises);
      } catch (e) {
        console.warn('Failed to delete messages subcollection', e);
      }

      try {
        const chatRef = doc(db, 'networkChats', networkId);
        await deleteDoc(chatRef);
      } catch (e) {
        console.warn('Failed to delete chat document', e);
      }
      
      await fetchEcosystemData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteNetworkModal = (networkId: string, networkName: string) => {
    setModalConfig({
      visible: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to permanently delete the network "${networkName}"? This cannot be undone.`,
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: 'Delete', onPress: () => handleDeleteNetwork(networkId), variant: 'danger' }
      ]
    });
  };

  const handleGenerateCode = async (networkId: string) => {
    if (!selectedEcosystemCode) return;
    const tempCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      await updateDoc(ecoRef, {
        [`networks.${networkId}.joinCode`]: tempCode,
        [`networks.${networkId}.joinCodeExpiresAt`]: expiresAt
      });
      await fetchEcosystemData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveMember = async (targetUserId: string, targetUid: string, networkId: string) => {
    if (!selectedEcosystemCode) return;
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      const targetNetworks = ecosystemUsers[targetUserId]?.networks || [];
      const newNetworks = targetNetworks.filter(id => id !== networkId);
      
      // Optimistic UI update
      setEcosystemUsers(prev => ({
        ...prev,
        [targetUserId]: {
          ...prev[targetUserId],
          networks: newNetworks
        }
      }));

      await updateDoc(ecoRef, {
        [`users.${targetUserId}.networks`]: newNetworks
      });

      const { arrayRemove } = require('@react-native-firebase/firestore');
      const chatRef = doc(db, 'networkChats', networkId);
      await updateDoc(chatRef, {
        allowedUids: arrayRemove(targetUid)
      });
      
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  };

  const handleInviteMember = async (targetUid: string, networkId: string, networkName: string) => {
    try {
      const db = getFirestore();
      const notifsRef = collection(db, 'users', targetUid, 'notifications');

      const newNotification = {
        type: 'NETWORK_INVITE',
        title: 'Network Invitation',
        message: `You have been invited to join the network: ${networkName}`,
        ecosystemId: selectedEcosystemCode,
        networkId: networkId,
        createdAt: Date.now(),
        read: false
      };

      await addDoc(notifsRef, newNotification);
      return true;
    } catch (error) {
      console.error('Failed to send invite', error);
      return false;
    }
  };

  const InviteModalContent = ({ networkId, networkName, network }: { networkId: string, networkName: string, network: any }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [invitedUsers, setInvitedUsers] = useState<Record<string, boolean>>({});

    React.useEffect(() => {
      if (network?.joinCodeExpiresAt) {
        const updateTimer = () => {
          const remaining = Math.max(0, network.joinCodeExpiresAt - Date.now());
          setTimeLeft(remaining);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
      } else {
        setTimeLeft(0);
      }
    }, [network?.joinCodeExpiresAt]);

    const usersArray = Object.values(ecosystemUsers).filter(u => u.firebaseUid !== user?.firebaseUid);

    return (
      <View style={{ width: '100%', marginTop: 12 }}>
        <View style={{ marginBottom: 16, padding: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
          {timeLeft > 0 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Code: {network.joinCode}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Clock color={colors.text.secondary} size={14} />
                <Text style={{ color: colors.text.secondary }}>{Math.ceil(timeLeft / 1000)}s</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={[styles.secondaryButton, { alignSelf: 'flex-start', paddingVertical: 10 }]} onPress={() => handleGenerateCode(networkId)}>
              <Key color={colors.primary} size={16} />
              <Text style={styles.secondaryButtonText}>Create Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={{ maxHeight: 250, width: '100%' }}>
          {usersArray.length === 0 ? <Text style={{ color: colors.text.secondary }}>No other users in ecosystem.</Text> : null}
          {usersArray.map((u, i) => {
            const isJoined = u.networks?.includes(networkId);
            return (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '500' }}>{u.displayName}</Text>
                {isJoined ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => handleRemoveMember(u.userId, u.firebaseUid, networkId)}>
                      <LogOut color={colors.danger} size={20} />
                    </TouchableOpacity>
                    <View style={[styles.secondaryButton, { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]}>
                      <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>Joined</Text>
                    </View>
                  </View>
                ) : invitedUsers[u.firebaseUid] ? (
                  <Text style={{ color: colors.text.secondary, fontWeight: 'bold', fontStyle: 'italic', paddingRight: 16 }}>Invited</Text>
                ) : (
                  <TouchableOpacity style={[styles.secondaryButton, { paddingHorizontal: 12, paddingVertical: 6 }]} onPress={async () => {
                    const success = await handleInviteMember(u.firebaseUid, networkId, networkName);
                    if (success) {
                      setInvitedUsers(prev => ({ ...prev, [u.firebaseUid]: true }));
                    }
                  }}>
                    <Text style={styles.secondaryButtonText}>Invite</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const handleJoinWithCode = async (code: string) => {
    if (!selectedEcosystemCode || !code.trim() || !user) return;
    setLoading(true);
    closeModal();
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      const ecoSnap = await getDoc(ecoRef);
      const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;
      if (isExisting) {
        const ecoData = ecoSnap.data();
        const nets = ecoData?.networks || {};
        let matchedNetworkId: string | null = null;
        let matchedNetwork: any = null;

        for (const [netId, net] of Object.entries(nets) as any) {
          if (net.joinCode === code && net.joinCodeExpiresAt && net.joinCodeExpiresAt > Date.now()) {
            matchedNetworkId = netId;
            matchedNetwork = net;
            break;
          }
        }

        if (matchedNetworkId) {
          const currentNetworks = ecosystemUsers[user.userId]?.networks || [];
          if (!currentNetworks.includes(matchedNetworkId)) {
            await updateDoc(ecoRef, {
              [`users.${user.userId}.networks`]: [...currentNetworks, matchedNetworkId]
            });

            const { arrayUnion } = require('@react-native-firebase/firestore');
            const chatRef = doc(db, 'networkChats', matchedNetworkId);
            await updateDoc(chatRef, {
              allowedUids: arrayUnion(user.firebaseUid)
            });

            await NotificationService.notifyEcosystemAdmins(selectedEcosystemCode, {
              type: 'NETWORK_JOIN',
              title: 'Network Update',
              message: `${user.displayName || 'A user'} joined the network ${matchedNetwork.name} via join code.`
            }, false);
          }
          await fetchEcosystemData();
          setTimeout(() => {
            setModalConfig({
              visible: true,
              title: 'Success',
              message: 'You have joined the network!',
              actions: [{ label: 'OK', onPress: closeModal, variant: 'primary' }]
            });
          }, 500);
        } else {
          setTimeout(() => {
            setModalConfig({
              visible: true,
              title: 'Invalid Code',
              message: 'The code is invalid or has expired.',
              actions: [{ label: 'OK', onPress: closeModal, variant: 'danger' }]
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showJoinModal = () => {
    let codeEntered = '';
    setModalConfig({
      visible: true,
      title: 'Join Network',
      message: 'Enter the 5-digit code provided by your admin:',
      customContent: (
        <TextInput
          style={[styles.input, { marginTop: 12, width: '100%' }]}
          placeholder="Code"
          placeholderTextColor={colors.text.secondary}
          onChangeText={(text) => { codeEntered = text.trim(); }}
          autoCapitalize="characters"
          autoFocus
        />
      ),
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: 'Join', onPress: () => handleJoinWithCode(codeEntered.toUpperCase()), variant: 'primary' }
      ]
    });
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Networks Hub</Text>
        </View>
        <TouchableOpacity
          style={styles.ecoSelector}
          onPress={() => {
            setModalConfig({
              visible: true,
              title: 'Select Ecosystem',
              message: 'Choose an ecosystem to view its networks:',
              customContent: (
                <View style={{ width: '100%', marginTop: 12 }}>
                  {Array.from(new Set([...(user?.ecosystems || []), ...(user?.ecosystemCode && user?.isSuperAdmin ? [user.ecosystemCode] : [])])).map((eco, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.ecoOption, selectedEcosystemCode === eco && styles.ecoOptionSelected]}
                      onPress={() => {
                        setSelectedEcosystemCode(eco);
                        closeModal();
                      }}
                    >
                      <Text style={[styles.ecoOptionText, selectedEcosystemCode === eco && { color: colors.primary }]}>{eco}</Text>
                    </TouchableOpacity>
                  ))}
                  {Array.from(new Set([...(user?.ecosystems || []), ...(user?.ecosystemCode && user?.isSuperAdmin ? [user.ecosystemCode] : [])])).length === 0 && (
                    <Text style={{ color: colors.text.secondary }}>No ecosystems available.</Text>
                  )}
                </View>
              ),
              actions: [{ label: 'Cancel', onPress: closeModal, variant: 'secondary' }]
            });
          }}
        >
          <Text style={styles.ecoSelectorText}>{selectedEcosystemCode || 'Select Eco'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.buttonRow}>
          {isEcosystemAdmin && (
            <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={showCreateNetworkModal}>
              <Plus color={colors.text.inverse} size={20} />
              <Text style={styles.primaryButtonText}>Create Network</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={showJoinModal}>
            <LogIn color={colors.primary} size={20} />
            <Text style={styles.secondaryButtonText}>Join via Code</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardTitle, { marginBottom: 16, marginTop: 24 }]}>My Networks</Text>

        {Object.entries(networks).filter(([netId, net]) => {
          return ecosystemUsers[user?.userId || '']?.networks?.includes(netId) || isEcosystemAdmin;
        }).length === 0 && (
            <Text style={{ color: colors.text.secondary, marginBottom: 16 }}>You haven't joined any networks yet.</Text>
          )}

        {Object.entries(networks).filter(([netId, net]) => {
          return ecosystemUsers[user?.userId || '']?.networks?.includes(netId) || isEcosystemAdmin;
        }).map(([netId, net]) => (
          <TouchableOpacity
            key={netId}
            style={styles.networkCard}
            onPress={() => {
              setActiveNetwork({ networkId: netId, ...net } as any);
              navigation.navigate('Main', { screen: 'Dashboard' });
            }}
          >
            <View style={styles.networkHeader}>
              <View>
                <Text style={styles.networkName}>{net.name}</Text>
                {net.description ? (
                  <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                    {net.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.memberBadge}>Member</Text>
            </View>

            {isEcosystemAdmin && (
              <View style={[styles.actionRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => setInviteModalNetworkId(netId)}>
                    <Users color={colors.primary} size={16} />
                    <Text style={styles.actionText}>Invite Members</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => showEditNetworkModal(netId, net.name, net.description)}>
                    <Edit2 color={colors.text.secondary} size={20} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={() => showDeleteNetworkModal(netId, net.name)}>
                    <Trash2 color={colors.danger} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        </ScrollView>
      )}

      <CustomModal
        visible={modalConfig.visible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        actions={modalConfig.actions}
        customContent={modalConfig.customContent}
      />

      <CustomModal
        visible={!!inviteModalNetworkId}
        onClose={() => setInviteModalNetworkId(null)}
        title="Invite Members"
        message="Generate a join code or directly invite users:"
        customContent={
          inviteModalNetworkId && networks[inviteModalNetworkId] ? (
            <InviteModalContent
              networkId={inviteModalNetworkId}
              networkName={networks[inviteModalNetworkId].name}
              network={networks[inviteModalNetworkId]}
            />
          ) : null
        }
        actions={[{ label: 'Done', onPress: () => setInviteModalNetworkId(null), variant: 'primary' }]}
      />
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: require('react-native').Dimensions.get('window').width > 768 ? 20 : 50,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: 24,
  },
  adminCard: {
    backgroundColor: 'rgba(255, 160, 0, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 0, 0.3)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  networkCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  networkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  memberBadge: {
    fontSize: 12,
    color: colors.success,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12,
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 16,
  },
  ecoSelector: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ecoSelectorText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  ecoOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ecoOptionSelected: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  ecoOptionText: {
    color: colors.text.primary,
    fontSize: 16,
  }
});
