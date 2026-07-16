import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  customContent?: React.ReactNode;
  actions?: ModalAction[];
  children?: React.ReactNode;
}

export const CustomModal: React.FC<CustomModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  customContent,
  actions,
  children
}) => {
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const getActionStyle = (variant: ModalAction['variant']) => {
    switch (variant) {
      case 'primary': return { bg: colors.primary, text: colors.text.inverse };
      case 'danger': return { bg: 'rgba(239, 68, 68, 0.1)', text: colors.danger };
      case 'secondary':
      default: return { bg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', text: colors.text.primary };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <KeyboardAvoidingView 
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}
              
              {customContent && (
                <View style={styles.contentContainer}>
                  {customContent}
                </View>
              )}

              {children && (
                <View style={styles.contentContainer}>
                  {children}
                </View>
              )}

              {actions && actions.length > 0 && (
                <View style={styles.actionsContainer}>
                  {actions.map((action, index) => {
                    const actionStyle = getActionStyle(action.variant);
                    return (
                      <TouchableOpacity 
                        key={index}
                        style={[styles.actionButton, { backgroundColor: actionStyle.bg }]}
                        onPress={() => {
                          action.onPress();
                          onClose();
                        }}
                      >
                        <Text style={[styles.actionText, { color: actionStyle.text }]}>
                          {action.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  contentContainer: {
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
