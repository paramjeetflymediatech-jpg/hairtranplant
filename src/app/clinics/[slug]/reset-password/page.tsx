import React, { Suspense } from 'react';
import { Clinic } from '@/db/models';
import { notFound } from 'next/navigation';
import ClinicResetPasswordClient from './ClinicResetPasswordClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClinicResetPasswordPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const clinic = await Clinic.findOne({ where: { slug } });
  if (!clinic) {
    notFound();
  }

  const serializedClinic = {
    name: clinic.name,
    slug: clinic.slug,
    logo: clinic.logo,
    phone: clinic.phone,
    email: clinic.email,
    backgroundImage: clinic.backgroundImage || null,
    themeColor: clinic.themeColor || null,
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ClinicResetPasswordClient clinic={serializedClinic} />
    </Suspense>
  );
}

