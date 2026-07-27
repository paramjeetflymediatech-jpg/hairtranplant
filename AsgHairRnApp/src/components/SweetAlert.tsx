import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated 
} from 'react-native';
import { THEME } from '../config/theme';

const { width } = Dimensions.get('window');

export interface SweetAlertProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function SweetAlert({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: SweetAlertProps) {
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  // Icon configurations
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: '#10B981' }]}>
            <Text style={[styles.iconText, { color: '#10B981' }]}>✓</Text>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}>
            <Text style={[styles.iconText, { color: '#EF4444' }]}>✕</Text>
          </View>
        );
      case 'warning':
      case 'confirm':
        return (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: '#F59E0B' }]}>
            <Text style={[styles.iconText, { color: '#F59E0B' }]}>⚠️</Text>
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(214, 57, 0, 0.12)', borderColor: THEME.primary }]}>
            <Text style={[styles.iconText, { color: THEME.primary }]}>ℹ</Text>
          </View>
        );
    }
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1]
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
        
        <Animated.View style={[styles.alertBox, { transform: [{ scale }], opacity }]}>
          {getIcon()}
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.btnRow}>
            {(type === 'confirm' || onCancel) && (
              <TouchableOpacity 
                style={[styles.btn, styles.btnCancel]} 
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.btn, 
                type === 'error' ? styles.btnError : styles.btnConfirm
              ]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 10, 0, 0.55)',
  },
  alertBox: {
    width: Math.min(width - 48, 340),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CC',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A0A00',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'System',
  },
  message: {
    fontSize: 13,
    color: '#7A4A30',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontFamily: 'System',
    paddingHorizontal: 6,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: THEME.primary,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  btnError: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  btnCancel: {
    backgroundColor: '#FFF8F5',
    borderWidth: 1.5,
    borderColor: '#FFE0CC',
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnCancelText: {
    color: '#7A4A30',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
