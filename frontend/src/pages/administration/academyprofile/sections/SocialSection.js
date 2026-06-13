import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiLink, FiFacebook, FiInstagram, FiGlobe as FiWeb } from 'react-icons/fi';
import { InfoItem, SectionCard } from '../components/ProfileUI';

const SocialSection = ({ academy }) => {
  const { t } = useTranslation('administrationprofile');

  return (
    <SectionCard title={t('sections.socialMedia')} icon={<FiLink size={20} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem icon={<FiWeb className="text-[#10B981]" size={20} />} label={t('fields.website')} value={academy.website} isLink={true} />
        <InfoItem icon={<FiFacebook className="text-[#4fb0ff]" size={20} />} label={t('fields.facebook')} value={academy.facebook} isLink={true} />
        <InfoItem icon={<FiInstagram className="text-[#902bd1]" size={20} />} label={t('fields.instagram')} value={academy.instagram} isLink={true} />
      </div>
    </SectionCard>
  );
};

export default SocialSection;
