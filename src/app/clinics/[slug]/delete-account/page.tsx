import React from 'react';
import { Clinic } from '@/db/models';
import { notFound } from 'next/navigation';
import ClinicDeleteAccountClient from './ClinicDeleteAccountClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClinicDeleteAccountPage({ params }: PageProps) {
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

  return <ClinicDeleteAccountClient clinic={serializedClinic} />;
}
