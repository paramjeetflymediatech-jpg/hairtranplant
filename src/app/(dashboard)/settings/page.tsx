'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Spin, Tabs, Table, Tag, Modal, Select, Avatar, Badge, Space } from 'antd';
import {
  SaveOutlined,
  PictureOutlined,
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  CompassOutlined,
  UserAddOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  StarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'CONSULTANT' | 'RECEPTIONIST' | 'CLINIC_ADMIN' | string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ClinicSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Clinic profile states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  
  // Custom asset previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState('#0d9488');

  // Team management states
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffForm] = Form.useForm();
  const selectedRole = Form.useWatch('role', staffForm);

  // Personal Admin Profile states
  const [userProfileForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userAvatarPreview, setUserAvatarPreview] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Curated color swatches for branding
  const presetColors = [
    { label: 'Teal Medical', hex: '#0d9488' },
    { label: 'Royal Sapphire', hex: '#2563eb' },
    { label: 'Deep Violet', hex: '#7c3aed' },
    { label: 'Crimson Ruby', hex: '#e11d48' },
    { label: 'Amber Gold', hex: '#d97706' },
    { label: 'Obsidian Dark', hex: '#0f172a' },
  ];

  // Load clinic data
  useEffect(() => {
    async function loadClinic() {
      try {
        const res = await fetch('/api/clinic');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load clinic');

        form.setFieldsValue({
          name: data.clinic.name,
          email: data.clinic.email,
          phone: data.clinic.phone || '',
          address: data.clinic.address || '',
          city: data.clinic.city || '',
          state: data.clinic.state || '',
          country: data.clinic.country || '',
          timezone: data.clinic.timezone || 'UTC',
          logo: data.clinic.logo || '',
          backgroundImage: data.clinic.backgroundImage || '',
          themeColor: data.clinic.themeColor || '#0d9488',
        });

        setLogoPreview(data.clinic.logo || null);
        setBgPreview(data.clinic.backgroundImage || null);
        setSlug(data.clinic.slug);
        setThemeColor(data.clinic.themeColor || '#0d9488');
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to fetch clinic details.',
          confirmButtonColor: '#0d9488',
        });
      } finally {
        setLoading(false);
      }
    }

    loadClinic();
  }, [form]);

  // Load team members
  const fetchTeamMembers = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const res = await fetch('/api/users?includeInactive=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch team members');
      setTeamList(data.users || []);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  // Load personal admin profile
  const fetchMyProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load user profile');

      userProfileForm.setFieldsValue({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        avatar: data.user.avatar || '',
      });

      setUserAvatarPreview(data.user.avatar || null);
      setCurrentUserRole(data.user.role);
    } catch (err: any) {
      console.error('Error loading my profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [userProfileForm]);

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamMembers();
    } else if (activeTab === 'myProfile') {
      fetchMyProfile();
    }
  }, [activeTab, fetchTeamMembers, fetchMyProfile]);

  // Handle Logo file upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      form.setFieldsValue({ logo: base64 });
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle BG file upload
  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      form.setFieldsValue({ backgroundImage: base64 });
      setBgPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle Personal Avatar file upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      userProfileForm.setFieldsValue({ avatar: base64 });
      setUserAvatarPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Submit clinic settings
  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      Swal.fire({
        icon: 'success',
        title: 'Branding & Profile Saved',
        text: 'Clinic details and visual theme parameters updated successfully.',
        confirmButtonColor: themeColor,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Something went wrong.',
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit Personal Admin Profile & Password Update
  const handleMyProfileFinish = async (values: any) => {
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirmation password do not match.',
        confirmButtonColor: '#e11d48',
      });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          avatar: values.avatar,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile details and password have been saved successfully.',
        confirmButtonColor: '#0d9488',
      });

      userProfileForm.setFieldsValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message || 'Something went wrong while saving your profile.',
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const standardRoles = ['DOCTOR', 'CONSULTANT', 'RECEPTIONIST', 'NURSE', 'TRICHOLOGIST', 'SURGICAL_TECH', 'CLINIC_ADMIN'];

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingMember(null);
    staffForm.resetFields();
    staffForm.setFieldsValue({ role: 'DOCTOR', customRoleTitle: '', isActive: true });
    setIsStaffModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    const isStandard = standardRoles.includes(member.role);
    staffForm.setFieldsValue({
      name: member.name,
      email: member.email,
      role: isStandard ? member.role : 'CUSTOM',
      customRoleTitle: isStandard ? '' : member.role.replace(/_/g, ' '),
      phone: member.phone || '',
      password: '',
      isActive: member.isActive,
    });
    setIsStaffModalOpen(true);
  };

  // Handle Save (Create or Update) Staff Member
  const handleStaffFormFinish = async (values: any) => {
    setSavingStaff(true);
    try {
      const isEditing = !!editingMember;
      const finalRole = values.role === 'CUSTOM' ? (values.customRoleTitle || 'STAFF') : values.role;

      const url = '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? { userId: editingMember.id, ...values, role: finalRole }
        : { ...values, role: finalRole };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} team member`);

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Profile Updated!' : 'Team Member Added!',
        text: `${values.name}'s profile details have been saved successfully.`,
        confirmButtonColor: '#0d9488',
      });

      setIsStaffModalOpen(false);
      setEditingMember(null);
      staffForm.resetFields();
      fetchTeamMembers();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: err.message || 'Could not save team member.',
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setSavingStaff(false);
    }
  };

  // Handle Toggle Active/Inactive Status
  const handleToggleStatus = async (user: TeamMember) => {
    const actionText = user.isActive ? 'deactivate' : 'activate';
    const result = await Swal.fire({
      title: `${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}?`,
      text: `Are you sure you want to ${actionText} this staff member's account access?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.isActive ? '#e11d48' : '#0d9488',
      confirmButtonText: `Yes, ${actionText}`,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/users?userId=${user.id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user status');

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: data.message || 'User status updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });

        fetchTeamMembers();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: err.message || 'Failed to update user status.',
          confirmButtonColor: '#e11d48',
        });
      }
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const roleColors: Record<string, string> = {
    DOCTOR: 'emerald',
    CONSULTANT: 'blue',
    RECEPTIONIST: 'amber',
    NURSE: 'cyan',
    TRICHOLOGIST: 'teal',
    SURGICAL_TECH: 'indigo',
    CLINIC_ADMIN: 'purple',
    SUPER_ADMIN: 'red',
  };

  const roleLabels: Record<string, string> = {
    DOCTOR: 'Doctor',
    CONSULTANT: 'Consultant',
    RECEPTIONIST: 'Receptionist',
    NURSE: 'Nurse',
    TRICHOLOGIST: 'Trichologist',
    SURGICAL_TECH: 'Surgical Technician',
    CLINIC_ADMIN: 'Clinic Admin',
    SUPER_ADMIN: 'Super Admin',
  };

  const formatRoleLabel = (role: string) => {
    if (roleLabels[role]) return roleLabels[role];
    return role
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const columns = [
    {
      title: 'Member',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TeamMember) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
            className="bg-teal-600 font-bold shrink-0"
          >
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <span className="font-bold text-slate-800 text-sm block">{record.name}</span>
            <span className="text-slate-400 text-xs">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = roleColors[role] || 'geekblue';
        return (
          <Tag color={color} className="font-semibold text-xs px-2.5 py-0.5 rounded-full border-0 uppercase">
            {formatRoleLabel(role)}
          </Tag>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || <span className="text-slate-300">—</span>,
    },
    {
      title: 'Account Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} className="font-bold text-xs px-2.5 py-0.5 rounded-full border-0">
          {isActive ? '🟢 Active (Started)' : '🔴 Stopped (Inactive)'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TeamMember) => (
        <Space size="small">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
            className="text-xs font-semibold text-teal-700 border-teal-200 hover:border-teal-400 hover:text-teal-900 rounded-lg"
          >
            Edit
          </Button>
          <Button
            type={record.isActive ? 'default' : 'primary'}
            danger={record.isActive}
            icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record)}
            className={`text-xs font-bold rounded-lg ${!record.isActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            {record.isActive ? 'Stop Account' : 'Start Account'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Settings & Profile Management</h1>
          <p className="text-slate-500 text-xs mt-1">Manage your personal admin account, clinic branding details, and team members.</p>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="custom-settings-tabs"
        items={[
          {
            key: 'profile',
            label: (
              <span className="font-bold px-2 py-1 flex items-center gap-2 text-sm">
                <ShopOutlined /> Clinic Profile & Theme
              </span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                {slug && (
                  <Card className="bg-teal-50 border border-teal-200 rounded-2xl shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider">Branded Public Hair Test Link</h3>
                        <p className="text-slate-600 text-xs mt-1">
                          Provide this diagnostics URL to your marketing leads and patients to capture their profile dynamically:
                        </p>
                        <a
                          href={`/clinics/${slug}/hair-test`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 hover:text-teal-900 font-bold text-xs underline mt-2 block break-all font-mono"
                        >
                          {originUrl}/clinics/{slug}/hair-test
                        </a>
                      </div>
                      <Button
                        type="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(`${originUrl}/clinics/${slug}/hair-test`);
                          Swal.fire({
                            icon: 'success',
                            title: 'Copied!',
                            text: 'Public hair test URL copied to clipboard.',
                            timer: 1500,
                            showConfirmButton: false,
                          });
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-xs font-bold shrink-0 rounded-lg"
                      >
                        Copy Link
                      </Button>
                    </div>
                  </Card>
                )}

                <Form form={form} layout="vertical" onFinish={handleFinish} className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <>
                      {/* Row 1: General Details and Address & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm rounded-2xl border border-slate-200" title="General Information">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item name="name" label="Clinic Name" rules={[{ required: true, message: 'Please enter clinic name' }]}>
                              <Input prefix={<ShopOutlined className="text-slate-400" />} placeholder="Clinic name" size="large" />
                            </Form.Item>

                            <Form.Item name="email" label="Contact Email" rules={[{ required: true, message: 'Please enter contact email' }]}>
                              <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="Contact email" size="large" />
                            </Form.Item>

                            <Form.Item name="phone" label="Contact Phone">
                              <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="Phone number" size="large" />
                            </Form.Item>

                            <Form.Item name="timezone" label="Timezone">
                              <Input placeholder="UTC / America/Los_Angeles" size="large" />
                            </Form.Item>
                          </div>
                        </Card>

                        <Card className="shadow-sm rounded-2xl border border-slate-200" title="Address & Location">
                          <div className="space-y-4">
                            <Form.Item name="address" label="Street Address">
                              <Input prefix={<CompassOutlined className="text-slate-400" />} placeholder="123 Medical Way" size="large" />
                            </Form.Item>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <Form.Item name="city" label="City">
                                <Input placeholder="City" size="large" />
                              </Form.Item>
                              <Form.Item name="state" label="State/Province">
                                <Input placeholder="State" size="large" />
                              </Form.Item>
                              <Form.Item name="country" label="Country">
                                <Input placeholder="Country" size="large" />
                              </Form.Item>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Row 2: Ultra-Modern Branding & Visual Theme Studio */}
                      <Card
                        className="shadow-md rounded-3xl border border-slate-200/80 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white"
                        title={
                          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base py-1">
                            <BgColorsOutlined className="text-teal-600 text-lg" />
                            <span>Branding & Visual Theme Studio</span>
                          </div>
                        }
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Column 1: Clinic Logo Dropzone */}
                          <div className="space-y-4 text-center bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                            <div>
                              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Clinic Brand Logo</span>
                              <p className="text-[11px] text-slate-400 font-medium mb-4">Displayed on patient portals and diagnostic headers</p>
                              
                              <div className="mx-auto w-36 h-36 rounded-2xl border-2 border-dashed border-teal-400/80 bg-teal-50/30 flex items-center justify-center overflow-hidden relative group transition-all hover:border-teal-500 hover:bg-teal-50/60 shadow-inner">
                                {logoPreview ? (
                                  <img src={logoPreview} alt="Brand Logo" className="max-w-full max-h-full object-contain p-2 transition-transform group-hover:scale-105" />
                                ) : (
                                  <div className="text-center p-3">
                                    <ShopOutlined className="text-4xl text-teal-400 mb-1" />
                                    <span className="text-[11px] font-bold text-slate-500 block">No Logo Uploaded</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-2">
                              <input
                                type="file"
                                accept="image/*"
                                id="logo-upload-input"
                                className="hidden"
                                style={{ display: 'none' }}
                                onChange={handleLogoChange}
                              />
                              <label
                                htmlFor="logo-upload-input"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                              >
                                <UploadOutlined /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
                              </label>
                              {logoPreview && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    form.setFieldsValue({ logo: '' });
                                    setLogoPreview(null);
                                  }}
                                  className="rounded-xl text-xs font-bold"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <Form.Item name="logo" style={{ display: 'none' }}>
                              <Input type="hidden" />
                            </Form.Item>
                          </div>

                          {/* Column 2: Public Hair Test Background Image Dropzone */}
                          <div className="space-y-4 text-center bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                            <div>
                              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Diagnostics Background Image</span>
                              <p className="text-[11px] text-slate-400 font-medium mb-4">Background banner for patient hair analysis wizard</p>
                              
                              <div className="mx-auto w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-900 flex items-center justify-center overflow-hidden relative group shadow-inner">
                                {bgPreview ? (
                                  <>
                                    <img src={bgPreview} alt="Background Preview" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform" />
                                    <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md">
                                      Live Preview
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-3 text-slate-400">
                                    <PictureOutlined className="text-4xl text-slate-500 mb-1" />
                                    <span className="text-[11px] font-bold text-slate-400 block">Default Studio Background</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-2">
                              <input
                                type="file"
                                accept="image/*"
                                id="bg-upload-input"
                                className="hidden"
                                style={{ display: 'none' }}
                                onChange={handleBgChange}
                              />
                              <label
                                htmlFor="bg-upload-input"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                              >
                                <UploadOutlined /> {bgPreview ? 'Change Banner' : 'Upload Banner'}
                              </label>
                              {bgPreview && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    form.setFieldsValue({ backgroundImage: '' });
                                    setBgPreview(null);
                                  }}
                                  className="rounded-xl text-xs font-bold"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <Form.Item name="backgroundImage" style={{ display: 'none' }}>
                              <Input type="hidden" />
                            </Form.Item>
                          </div>

                          {/* Column 3: Custom Accent Color & Live Studio Preview */}
                          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                            <div>
                              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Theme Accent Color</span>
                              <p className="text-[11px] text-slate-400 font-medium mb-3">Primary brand color applied across your patient portals</p>

                              {/* Preset Color Swatches */}
                              <div className="space-y-2 mb-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preset Luxury Palettes</span>
                                <div className="grid grid-cols-6 gap-2">
                                  {presetColors.map((color) => (
                                    <button
                                      key={color.hex}
                                      type="button"
                                      title={color.label}
                                      onClick={() => {
                                        form.setFieldsValue({ themeColor: color.hex });
                                        setThemeColor(color.hex);
                                      }}
                                      style={{ backgroundColor: color.hex }}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform shadow-xs ${
                                        themeColor.toLowerCase() === color.hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                                      }`}
                                    >
                                      {themeColor.toLowerCase() === color.hex.toLowerCase() && (
                                        <CheckCircleOutlined className="text-white text-xs" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Hex Input & Picker */}
                              <Form.Item name="themeColor" noStyle>
                                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                  <input
                                    type="color"
                                    className="w-9 h-9 p-0.5 border-0 rounded-lg cursor-pointer shrink-0 bg-transparent"
                                    value={themeColor}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      form.setFieldsValue({ themeColor: val });
                                      setThemeColor(val);
                                    }}
                                  />
                                  <Input
                                    value={themeColor}
                                    placeholder="#0d9488"
                                    maxLength={7}
                                    size="middle"
                                    className="font-mono text-xs font-extrabold uppercase border-slate-200"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      form.setFieldsValue({ themeColor: val });
                                      setThemeColor(val);
                                    }}
                                  />
                                </div>
                              </Form.Item>
                            </div>

                            {/* Live UI Theme Mock Preview */}
                            <div className="pt-3 border-t border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Live Element Preview</span>
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    style={{ backgroundColor: themeColor }}
                                    className="px-3 py-1 rounded-lg text-white text-[11px] font-bold shadow-xs transition-opacity hover:opacity-90"
                                  >
                                    Primary Button
                                  </button>
                                  <span
                                    style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}15` }}
                                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                                  >
                                    Active Badge
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: '70%', backgroundColor: themeColor }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <div className="flex justify-end pt-4 border-t border-slate-200">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          size="large"
                          loading={saving}
                          style={{ backgroundColor: themeColor, borderColor: themeColor }}
                          className="px-8 rounded-xl font-extrabold text-white shadow-md transition-all hover:opacity-90"
                        >
                          Save Theme & Profile Settings
                        </Button>
                      </div>
                    </>
                  )}
                </Form>
              </div>
            ),
          },
          {
            key: 'team',
            label: (
              <span className="font-bold px-2 py-1 flex items-center gap-2 text-sm">
                <TeamOutlined /> Doctors & Team Members
              </span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                <Card
                  className="shadow-sm rounded-2xl border border-slate-200"
                  title={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                      <div>
                        <h2 className="text-base font-bold text-slate-800">Clinic Doctors & Staff</h2>
                        <p className="text-xs font-normal text-slate-500">
                          Manage doctors, consultants, receptionists, and clinic administrators assigned to your clinic.
                        </p>
                      </div>
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={handleOpenAddModal}
                        className="bg-teal-600 hover:bg-teal-700 font-bold rounded-xl shrink-0"
                      >
                        + Add Doctor / Staff Member
                      </Button>
                    </div>
                  }
                >
                  <Table
                    columns={columns}
                    dataSource={teamList}
                    rowKey="id"
                    loading={loadingTeam}
                    pagination={{ pageSize: 10 }}
                    className="border-t border-slate-100"
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'myProfile',
            label: (
              <span className="font-bold px-2 py-1 flex items-center gap-2 text-sm">
                <UserOutlined /> My Personal Profile & Security
              </span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                {loadingProfile ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Form
                    form={userProfileForm}
                    layout="vertical"
                    onFinish={handleMyProfileFinish}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Avatar Upload Card */}
                      <Card className="shadow-sm rounded-2xl border border-slate-200 text-center" title="Profile Photo">
                        <div className="space-y-4">
                          <div className="mx-auto w-32 h-32 rounded-full border-2 border-teal-500 p-1 bg-slate-50 flex items-center justify-center overflow-hidden">
                            {userAvatarPreview ? (
                              <img src={userAvatarPreview} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <Avatar size={110} icon={<UserOutlined />} className="bg-teal-600 text-4xl" />
                            )}
                          </div>
                          <div>
                            <Tag color={roleColors[currentUserRole] || 'default'} className="font-bold text-xs px-3 py-1 rounded-full uppercase">
                              {formatRoleLabel(currentUserRole)}
                            </Tag>
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              id="user-avatar-upload-input"
                              className="hidden"
                              style={{ display: 'none' }}
                              onChange={handleAvatarChange}
                            />
                            <label
                              htmlFor="user-avatar-upload-input"
                              className="inline-block px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:border-slate-500 cursor-pointer transition-colors"
                            >
                              Upload Profile Photo
                            </label>
                          </div>
                          <Form.Item name="avatar" style={{ display: 'none' }}>
                            <Input type="hidden" />
                          </Form.Item>
                        </div>
                      </Card>

                      {/* Right: Personal Details & Password Change */}
                      <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-sm rounded-2xl border border-slate-200" title="Personal Information">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item
                              name="name"
                              label="Full Name"
                              rules={[{ required: true, message: 'Please enter your full name' }]}
                            >
                              <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="Full Name" size="large" />
                            </Form.Item>

                            <Form.Item name="email" label="Email Address (Login Username)">
                              <Input prefix={<MailOutlined className="text-slate-400" />} disabled size="large" className="bg-slate-100 text-slate-500 font-medium" />
                            </Form.Item>

                            <Form.Item name="phone" label="Personal Phone Number">
                              <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="+1 (555) 000-0000" size="large" />
                            </Form.Item>
                          </div>
                        </Card>

                        <Card
                          className="shadow-sm rounded-2xl border border-slate-200"
                          title={
                            <div className="flex items-center gap-2">
                              <SafetyCertificateOutlined className="text-teal-600" />
                              <span>Change Account Password</span>
                            </div>
                          }
                        >
                          <p className="text-slate-400 text-xs mb-4">
                            Leave password fields blank if you do not wish to update your login password.
                          </p>
                          <div className="space-y-4">
                            <Form.Item name="currentPassword" label="Current Password">
                              <Input.Password prefix={<KeyOutlined className="text-slate-400" />} placeholder="Enter current password" size="large" />
                            </Form.Item>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Form.Item name="newPassword" label="New Password">
                                <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder="Enter new password" size="large" />
                              </Form.Item>

                              <Form.Item name="confirmPassword" label="Confirm New Password">
                                <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder="Re-enter new password" size="large" />
                              </Form.Item>
                            </div>
                          </div>
                        </Card>

                        <div className="flex justify-end pt-2">
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                            loading={savingProfile}
                            className="px-8 rounded-xl font-bold bg-teal-600 hover:bg-teal-700"
                          >
                            Save My Profile & Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Add / Edit Doctor / Staff Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg pb-2 border-b border-slate-100">
            {editingMember ? <EditOutlined className="text-teal-600" /> : <UserAddOutlined className="text-teal-600" />}
            {editingMember ? `Edit Team Member - ${editingMember.name}` : 'Add Doctor / Staff Member'}
          </div>
        }
        open={isStaffModalOpen}
        onCancel={() => {
          setIsStaffModalOpen(false);
          setEditingMember(null);
          staffForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
        centered
        width={540}
      >
        <Form
          form={staffForm}
          layout="vertical"
          onFinish={handleStaffFormFinish}
          initialValues={{ role: 'DOCTOR' }}
          className="space-y-4 pt-4"
        >
          <Form.Item
            name="name"
            label={<span className="font-semibold text-slate-700 text-xs">Full Name</span>}
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="e.g. Dr. Alexander Vance, MD" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="font-semibold text-slate-700 text-xs">Email Address</span>}
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="dr.vance@clinic.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span className="font-semibold text-slate-700 text-xs">
                {editingMember ? 'New Password (leave blank to keep current)' : 'Password'}
              </span>
            }
            rules={editingMember ? [] : [{ required: true, message: 'Please enter account password' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder={editingMember ? 'Leave blank to keep existing password' : 'Enter initial password'} size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label={<span className="font-semibold text-slate-700 text-xs">Role Title</span>}
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select size="large">
                <Select.Option value="DOCTOR">🩺 Doctor (Physician)</Select.Option>
                <Select.Option value="CONSULTANT">📋 Hair Consultant</Select.Option>
                <Select.Option value="RECEPTIONIST">📞 Receptionist</Select.Option>
                <Select.Option value="NURSE">👩‍⚕️ Nurse</Select.Option>
                <Select.Option value="TRICHOLOGIST">🔬 Trichologist</Select.Option>
                <Select.Option value="SURGICAL_TECH">✂️ Surgical Technician</Select.Option>
                <Select.Option value="CLINIC_ADMIN">👑 Clinic Admin</Select.Option>
                <Select.Option value="CUSTOM">✨ + Type Custom Role...</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="font-semibold text-slate-700 text-xs">Phone Number</span>}
            >
              <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="+1 (555) 019-2834" size="large" />
            </Form.Item>
          </div>

          {selectedRole === 'CUSTOM' && (
            <Form.Item
              name="customRoleTitle"
              label={<span className="font-semibold text-teal-700 text-xs">Custom Role Title</span>}
              rules={[{ required: true, message: 'Please enter custom role title' }]}
            >
              <Input prefix={<UserOutlined className="text-teal-500" />} placeholder="e.g. Lead Anesthesiologist, Patient Concierge, Billing Specialist" size="large" />
            </Form.Item>
          )}

          <Form.Item
            name="isActive"
            label={<span className="font-semibold text-slate-700 text-xs">Account Access Status</span>}
          >
            <Select size="large">
              <Select.Option value={true}>🟢 Active (Start Account - Allow Login Access)</Select.Option>
              <Select.Option value={false}>🔴 Stopped / Inactive (Stop Account - Block Login Access)</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              onClick={() => {
                setIsStaffModalOpen(false);
                setEditingMember(null);
                staffForm.resetFields();
              }}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={savingStaff}
              className="bg-teal-600 hover:bg-teal-700 font-bold rounded-xl px-6"
            >
              {editingMember ? 'Save Changes' : 'Save & Create Member'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
