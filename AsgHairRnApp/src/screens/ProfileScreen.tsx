import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { BASE_URL } from '../config/apiConfig';
import { THEME } from '../config/theme';

type Props = {
  token: string;
  patientName: string;
  patientStatus: string;
  patientPhone: string;
  onDrawerOpen: () => void;
  onLogout: () => void;
  onBack: () => void;
  onProfileSaved: (name: string, phone: string, newToken?: string) => void;
};

export default function ProfileScreen({
  token, patientName, patientStatus, patientPhone,
  onDrawerOpen, onLogout, onBack, onProfileSaved,
}: Props) {
  const [editName, setEditName] = useState(patientName);
  const [editPhone, setEditPhone] = useState(patientPhone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    if (!editName.trim()) { Alert.alert('Validation Error', 'Full Name is required.'); return; }
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.'); return;
    }
    setIsSaving(true);
    try {
      const payload: any = { name: editName.trim(), phone: editPhone.trim() };
      if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: `graftdesk_session=${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      onProfileSaved(data.user?.name || editName, data.user?.phone || editPhone, data.token);
      Alert.alert('Success ✓', 'Your profile has been updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally { setIsSaving(false); }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action is permanent and will delete all your clinical records, appointments, and photos.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const res = await fetch(`${BASE_URL}/api/auth/me`, {
                method: 'DELETE',
                headers: { Cookie: `graftdesk_session=${token}` },
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to delete account');
              Alert.alert('Account Deleted', 'Your account has been deleted permanently.');
              onLogout();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete account');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={onDrawerOpen}>
          <View style={s.hamLine} /><View style={s.hamLine} /><View style={s.hamLine} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Profile</Text>
          <Text style={s.headerSub}>Account settings</Text>
        </View>
        <View style={s.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{patientName ? patientName.charAt(0).toUpperCase() : 'P'}</Text>
          </View>
          <Text style={s.avatarName}>{patientName}</Text>
          <View style={s.badge}><Text style={s.badgeText}>{patientStatus || 'CONSULTATION'}</Text></View>
        </View>

        {/* Personal */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Personal Details</Text>
          <Text style={s.label}>Full Name <Text style={s.req}>*</Text></Text>
          <TextInput value={editName} onChangeText={setEditName} style={s.input} placeholderTextColor={THEME.textSecondary} placeholder="Your full name" />
          <Text style={s.label}>Phone Number</Text>
          <TextInput value={editPhone} onChangeText={setEditPhone} style={s.input} keyboardType="phone-pad" placeholderTextColor={THEME.textSecondary} placeholder="Phone (optional)" />
        </View>

        {/* Password */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Change Password</Text>
          <Text style={s.cardNote}>Leave blank to keep your current password.</Text>
          
          <Text style={s.label}>Current Password</Text>
          <View style={s.passwordInputContainer}>
            <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry={!showCurrentPassword} style={s.passwordInput} placeholderTextColor={THEME.textSecondary} placeholder="Current password" />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={s.eyeButton}>
              <Text style={s.eyeText}>{showCurrentPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.label}>New Password</Text>
          <View style={s.passwordInputContainer}>
            <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNewPassword} style={s.passwordInput} placeholderTextColor={THEME.textSecondary} placeholder="New password" />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={s.eyeButton}>
              <Text style={s.eyeText}>{showNewPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.label}>Confirm New Password</Text>
          <View style={s.passwordInputContainer}>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} style={s.passwordInput} placeholderTextColor={THEME.textSecondary} placeholder="Confirm new password" />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={s.eyeButton}>
              <Text style={s.eyeText}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount} disabled={isDeleting}>
          {isDeleting ? <ActivityIndicator color="#E53E3E" /> : <Text style={s.deleteBtnText}>Delete Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: THEME.headerBg, paddingHorizontal: 16, paddingVertical: 14, paddingTop: 20,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: THEME.textOnDark, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { color: THEME.accent, fontSize: 10, fontWeight: 'bold', marginTop: 1 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamLine: { width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2, marginVertical: 2 },
  scroll: { padding: 20, paddingBottom: 50 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    elevation: 6, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  avatarName: { fontSize: 18, fontWeight: 'bold', color: THEME.textPrimary, marginBottom: 6 },
  badge: { backgroundColor: THEME.badge, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 14 },
  badgeText: { color: THEME.badgeText, fontSize: 10, fontWeight: 'bold' },
  card: {
    backgroundColor: THEME.card, borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: THEME.cardBorder,
    elevation: 2, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: THEME.primary, marginBottom: 4 },
  cardNote: { fontSize: 11, color: THEME.textSecondary, marginBottom: 14 },
  label: { fontSize: 11, color: THEME.textSecondary, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  req: { color: '#E53E3E' },
  input: {
    borderWidth: 1.5, borderColor: THEME.cardBorder, borderRadius: 14,
    height: 48, paddingHorizontal: 16, fontSize: 13, color: THEME.textPrimary, backgroundColor: THEME.bg,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.cardBorder,
    borderRadius: 14,
    height: 48,
    backgroundColor: THEME.bg,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 13,
    color: THEME.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: THEME.primary, borderRadius: 16, height: 52,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    elevation: 4, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    borderWidth: 1.5, borderColor: THEME.primary, borderRadius: 16, height: 48,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoutBtnText: { color: THEME.primary, fontWeight: 'bold', fontSize: 14 },
  deleteBtn: {
    borderWidth: 1.5, borderColor: '#E53E3E', borderRadius: 16, height: 48,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  deleteBtnText: { color: '#E53E3E', fontWeight: 'bold', fontSize: 14 },
  backBtn: { height: 44, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: THEME.textSecondary, fontWeight: 'bold', fontSize: 13 },
});
