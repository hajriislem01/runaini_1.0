import React from 'react';

const InfoItem = ({ icon, label, value, verified = false, isLink = false }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="text-gray-500 mt-1">{icon}</span>}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center gap-2">
          {isLink ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            <p className="font-medium">{value}</p>
          )}
          {verified && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoItem; 