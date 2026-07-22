import React from 'react';
import { Clinic } from '@/db/models';
import { notFound } from 'next/navigation';
import ClinicHairTestClient from '../hair-test/ClinicHairTestClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClinicHairTestPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const clinic = await Clinic.findOne({ where: { slug } });
  if (!clinic) {
    notFound();
  }

  // Serialize only public safe parameters
  const serializedClinic = {
    name: clinic.name,
    slug: clinic.slug,
    logo: clinic.logo,
    phone: clinic.phone,
    email: clinic.email,
    backgroundImage: clinic.backgroundImage || null,
    themeColor: clinic.themeColor || null,
  };

  return <ClinicHairTestClient clinic={serializedClinic} />;
}
