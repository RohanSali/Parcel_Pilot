import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Switch } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { getFirestore, doc, getDoc, updateDoc } from '@react-native-firebase/firestore';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';
import { ArrowLeft, Plus, Edit2, Trash2, Shield, Users } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { EcosystemUser } from '../models/Ecosystem';

const ALL_PERMISSIONS = [
  'canAssignTask', 'canCancelTask', 'canSetTaskPriority', 'canEditMap',
  'canPublishMapVersion', 'canRollbackMap', 'canRegisterVehicle', 'canAssignVehicle',
  'canManualControl', 'canViewAnalytics', 'canEditNetwork', 'canInviteUsers',
  'canCreateUsers', 'canDeleteUsers', 'canCreateRoles', 'canViewActivityFeed',
  'canBroadcastMessage', 'canManageNotificationSettings'
];

export const RolesManagementScreen = () => {
  const { user } = useAuthStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');
  const [selectedEcosystemCode, setSelectedEcosystemCode] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Initialize selected ecosystem when user loads
  useEffect(() => {
    if (user?.ecosystemCode && !selectedEcosystemCode) {
      setSelectedEcosystemCode(user.ecosystemCode);
    }
  }, [user]);
  
  // Data State
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [customRoles, setCustomRoles] = useState<Record<string, string[]>>({});
  const [ecosystemUsers, setEcosystemUsers] = useState<(EcosystemUser & { userId: string; displayName: string })[]>([]);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    customContent?: React.ReactNode;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
    setEditingRole(null);
    setCreatingRole(false);
    setNewRoleName('');
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedEcosystemCode) {
        fetchData();
      }
    }, [user, selectedEcosystemCode])
  );

  const fetchData = async () => {
    if (!selectedEcosystemCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      const ecoSnap = await getDoc(ecoRef);
      
      const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;
      if (isExisting) {
        const data = ecoSnap.data();
        const usersMap = data?.users || {};
        
        // Check if user is Admin or SuperAdmin in this ecosystem
        const currentUserRole = usersMap[user.userId]?.role;
        if (currentUserRole !== 'Admin' && currentUserRole !== 'SuperAdmin') {
          setPermissions({});
          setCustomRoles({});
          setEcosystemUsers([]);
          setHasPermission(false);
          setLoading(false);
          return;
        }

        setHasPermission(true);
        setPermissions(data?.permissions || {});
        setCustomRoles(data?.customRoles || {});
        const usersArray: (EcosystemUser & { userId: string; displayName: string })[] = [];
        
        for (const [userId, uData] of Object.entries(usersMap)) {
          const ecoUser = uData as EcosystemUser;
          if (ecoUser.role === 'User') {
            let displayName = 'Unknown User';
            try {
              const uRef = doc(db, 'users', ecoUser.firebaseUid);
              const uSnap = await getDoc(uRef);
              const isUserExisting = typeof uSnap.exists === 'function' ? uSnap.exists() : uSnap.exists;
              if (isUserExisting) {
                displayName = uSnap.data()?.displayName || 'Unknown User';
              }
            } catch (e) {
              console.warn('Failed to fetch user name', e);
            }
            usersArray.push({
              ...ecoUser,
              userId,
              displayName
            });
          }
        }
        setEcosystemUsers(usersArray);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (roleName: string) => {
    if (!selectedEcosystemCode || !roleName.trim()) return;
    const cleanName = roleName.trim();
    if (customRoles[cleanName]) {
      setModalConfig({
        visible: true,
        title: 'Error',
        message: 'A role with this name already exists.',
        actions: [{ label: 'OK', onPress: closeModal, variant: 'danger' }]
      });
      return;
    }

    setLoading(true);
    closeModal();
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      const updatedCustomRoles = { ...customRoles, [cleanName]: [] };
      
      setCustomRoles(updatedCustomRoles); // Optimistic

      await updateDoc(ecoRef, { customRoles: updatedCustomRoles });
    } catch (error) {
      console.error('Failed to create role', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (!selectedEcosystemCode) return;
    setLoading(true);
    closeModal();
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      
      const newCustomRoles = { ...customRoles };
      delete newCustomRoles[roleName];

      const newPermissions = { ...permissions };
      for (const p of Object.keys(newPermissions)) {
        newPermissions[p] = newPermissions[p].filter(r => r !== roleName);
      }

      await updateDoc(ecoRef, { 
        customRoles: newCustomRoles,
        permissions: newPermissions
      });
      
      setCustomRoles(newCustomRoles);
      setPermissions(newPermissions);
    } catch (error) {
      console.error('Failed to delete role', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (roleName: string, permission: string, value: boolean) => {
    if (!selectedEcosystemCode) return;
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      
      const currentPermArray = permissions[permission] || [];
      const newPermArray = value 
        ? [...currentPermArray, roleName] 
        : currentPermArray.filter(r => r !== roleName);

      const newPermissions = { ...permissions, [permission]: newPermArray };
      setPermissions(newPermissions); // Optimistic

      await updateDoc(ecoRef, {
        [`permissions.${permission}`]: newPermArray
      });
    } catch (error) {
      console.error('Failed to toggle permission', error);
      fetchData(); // Revert on failure
    }
  };

  const handleToggleUserRole = async (userId: string, roleName: string, value: boolean) => {
    if (!selectedEcosystemCode) return;
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', selectedEcosystemCode);
      
      const currentUserArray = customRoles[roleName] || [];
      const newUserArray = value 
        ? [...currentUserArray, userId] 
        : currentUserArray.filter(u => u !== userId);

      const newCustomRoles = { ...customRoles, [roleName]: newUserArray };
      setCustomRoles(newCustomRoles); // Optimistic

      await updateDoc(ecoRef, {
        [`customRoles.${roleName}`]: newUserArray
      });
    } catch (error) {
      console.error('Failed to assign role', error);
      fetchData(); // Revert on failure
    }
  };

  const showCreateModal = () => {
    setCreatingRole(true);
  };

  const showEditRoleModal = (roleName: string) => {
    setEditingRole(roleName);
  };

  const showDeleteModal = (roleName: string) => {
    setModalConfig({
      visible: true,
      title: 'Delete Role',
      message: `Are you sure you want to delete the role "${roleName}"? This will remove the role from all users.`,
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: 'Delete', onPress: () => handleDeleteRole(roleName), variant: 'danger' }
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
          <Text style={styles.headerTitle}>Users and Roles</Text>
        </View>
        <TouchableOpacity
          style={styles.ecoSelector}
          onPress={() => {
            setModalConfig({
              visible: true,
              title: 'Select Ecosystem',
              message: 'Choose an ecosystem to manage roles:',
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
          <Text style={styles.ecoSelectorText}>{selectedEcosystemCode || 'Select Ecosystem'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'roles' && styles.activeTab]} 
          onPress={() => setActiveTab('roles')}
        >
          <Shield color={activeTab === 'roles' ? colors.primary : colors.text.secondary} size={20} />
          <Text style={[styles.tabText, activeTab === 'roles' && styles.activeTabText]}>Roles</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]} 
          onPress={() => setActiveTab('assignments')}
        >
          <Users color={activeTab === 'assignments' ? colors.primary : colors.text.secondary} size={20} />
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>Assignments</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !hasPermission ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Shield color={colors.text.secondary} size={48} style={{ marginBottom: 16 }} />
          <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Access Denied</Text>
          <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>You must be an Admin or SuperAdmin in this ecosystem to manage custom roles.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'roles' ? (
            <>
              <TouchableOpacity style={styles.createButton} onPress={showCreateModal}>
                <Plus color={colors.text.inverse} size={20} />
                <Text style={styles.createButtonText}>Create Role</Text>
              </TouchableOpacity>
              
              {Object.keys(customRoles).map((roleName) => (
                <View key={roleName} style={styles.roleCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleName}>{roleName}</Text>
                    <Text style={styles.roleStats}>{(customRoles[roleName] || []).length} Users Assigned</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => showEditRoleModal(roleName)}>
                      <Edit2 color={colors.text.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => showDeleteModal(roleName)}>
                      <Trash2 color={colors.danger} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              {ecosystemUsers.length === 0 ? (
                <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 24 }}>No standard users available to assign roles.</Text>
              ) : null}
              {ecosystemUsers.map((ecoUser) => (
                <View key={ecoUser.userId} style={styles.userCard}>
                  <Text style={styles.userName}>{ecoUser.displayName}</Text>
                  <View style={styles.roleTogglesContainer}>
                    {Object.keys(customRoles).length === 0 ? (
                      <Text style={{ color: colors.text.secondary }}>No custom roles exist yet.</Text>
                    ) : null}
                    {Object.keys(customRoles).map((roleName) => {
                      const hasRole = (customRoles[roleName] || []).includes(ecoUser.userId);
                      return (
                        <View key={roleName} style={styles.permissionRow}>
                          <Text style={styles.permissionText}>{roleName}</Text>
                          <Switch
                            value={hasRole}
                            onValueChange={(val) => handleToggleUserRole(ecoUser.userId, roleName, val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      <CustomModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        customContent={modalConfig.customContent}
        actions={modalConfig.actions}
        onClose={closeModal}
      />

      {/* Inline Create Role Modal */}
      <CustomModal
        visible={creatingRole}
        title="Create Custom Role"
        message="Enter a unique name for the new role."
        customContent={
          <TextInput
            style={styles.input}
            placeholder="Role Name"
            placeholderTextColor={colors.text.secondary}
            value={newRoleName}
            onChangeText={setNewRoleName}
            autoFocus
          />
        }
        actions={[
          { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
          { label: 'Create', onPress: () => handleCreateRole(newRoleName), variant: 'primary' }
        ]}
        onClose={closeModal}
      />

      {/* Inline Edit Role Modal */}
      <CustomModal
        visible={!!editingRole}
        title={`Edit ${editingRole}`}
        message={`Configure permissions for ${editingRole}. Changes save automatically.`}
        customContent={
          <View style={{ height: 350, width: '100%', marginTop: 12 }}>
            <ScrollView>
              {editingRole && ALL_PERMISSIONS.map(perm => {
                const hasPerm = (permissions[perm] || []).includes(editingRole);
                return (
                  <View key={perm} style={styles.permissionRow}>
                    <Text style={styles.permissionText}>{perm}</Text>
                    <Switch
                      value={hasPerm}
                      onValueChange={(val) => handleTogglePermission(editingRole, perm, val)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        }
        actions={[{ label: 'Done', onPress: closeModal, variant: 'primary' }]}
        onClose={closeModal}
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
    paddingTop: require('react-native').Dimensions.get('window').width > 768 ? 20 : 60,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  scrollContent: {
    padding: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  createButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  roleStats: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  userCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  roleTogglesContainer: {
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permissionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  input: {
    width: '100%',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 16,
    marginTop: 12,
  },
  ecoSelector: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ecoSelectorText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  ecoOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ecoOptionSelected: {
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.1)' : 'rgba(10, 132, 255, 0.05)',
  },
  ecoOptionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
});
