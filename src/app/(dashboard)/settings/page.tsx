'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Spin } from 'antd';
import { SaveOutlined, PictureOutlined, ShopOutlined, MailOutlined, PhoneOutlined, CompassOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

export default function ClinicSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  
  // Custom asset previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState('#0d9488');

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
          confirmButtonColor: '#0d9488'
        });
      } finally {
        setLoading(false);
      }
    }

    loadClinic();
  }, [form]);

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

  // Submit settings
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
        title: 'Settings Saved',
        text: 'Clinic profile and theme parameters updated successfully.',
        confirmButtonColor: '#0d9488'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Something went wrong.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSaving(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Profile & Theme</h1>
        <p className="text-slate-500 text-xs">Configure your clinic details, brand logo, and custom diagnostics background theme.</p>
      </div>

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

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-6"
      >
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
                  <Form.Item
                    name="name"
                    label="Clinic Name"
                    rules={[{ required: true, message: 'Please enter clinic name' }]}
                  >
                    <Input prefix={<ShopOutlined className="text-slate-400" />} placeholder="Clinic name" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Contact Email"
                    rules={[{ required: true, message: 'Please enter contact email' }]}
                  >
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

            {/* Row 2: Branding and Visual Theme Customization in a 3-column Grid inside a Card */}
            <Card className="shadow-sm rounded-2xl border border-slate-200" title="Branding & Visual Theme">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Brand Logo */}
                <div className="space-y-4 text-center border-r border-slate-100 pr-6 last:border-r-0 last:pr-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinic Logo</span>
                  <div className="mx-auto w-32 h-32 rounded-2xl border border-slate-250 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ShopOutlined className="text-3xl text-slate-300" />
                    )}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload-input"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <label
                      htmlFor="logo-upload-input"
                      className="inline-block px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:border-slate-500 cursor-pointer transition-colors"
                    >
                      Upload Brand Logo
                    </label>
                    {logoPreview && (
                      <Button
                        type="default"
                        danger
                        onClick={() => {
                          form.setFieldsValue({ logo: '' });
                          setLogoPreview(null);
                        }}
                        className="rounded-xl text-xs font-semibold"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <Form.Item name="logo" className="hidden">
                    <Input />
                  </Form.Item>
                </div>

                {/* Column 2: Custom Diagnostics Background Image */}
                <div className="space-y-4 text-center border-r border-slate-100 pr-6 last:border-r-0 last:pr-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Diagnostics Background Image</span>
                  <div className="mx-auto w-full h-32 rounded-2xl border border-slate-250 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                    {bgPreview ? (
                      <img src={bgPreview} alt="Background Preview" className="w-full h-full object-cover" />
                    ) : (
                      <PictureOutlined className="text-3xl text-slate-300" />
                    )}
                    <div className="absolute bottom-1 right-1 bg-slate-900/60 backdrop-blur px-2 py-0.5 rounded text-[8px] text-white">
                      Preview
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="bg-upload-input"
                      className="hidden"
                      onChange={handleBgChange}
                    />
                    <label
                      htmlFor="bg-upload-input"
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Upload Background Image
                    </label>
                    {bgPreview && (
                      <Button
                        type="default"
                        danger
                        onClick={() => {
                          form.setFieldsValue({ backgroundImage: '' });
                          setBgPreview(null);
                        }}
                        className="rounded-xl text-xs font-bold border-red-200"
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                  <Form.Item name="backgroundImage" className="hidden">
                    <Input />
                  </Form.Item>
                </div>

                {/* Column 3: Color Override Choice */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Diagnostics Theme Accent Color</span>
                    <p className="text-slate-400 text-[10px] leading-normal mb-4">
                      ℹ️ Pick the brand color accent used for dynamic wizard indicators, checkboxes, and buttons when no background image is set.
                    </p>
                    <Form.Item name="themeColor" noStyle>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="w-12 h-10 p-0.5 border border-slate-200 rounded-xl cursor-pointer shrink-0"
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
                          size="large"
                          className="font-mono text-xs uppercase"
                          onChange={(e) => {
                            const val = e.target.value;
                            form.setFieldsValue({ themeColor: val });
                            setThemeColor(val);
                          }}
                        />
                      </div>
                    </Form.Item>
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
                className="px-8 rounded-xl font-bold bg-teal-600 hover:bg-teal-700"
              >
                Save Theme & Profile settings
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
