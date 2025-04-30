import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './ResponsiveWrapper.css';

function ResponsiveWrapper({ children }) {
  const { deviceType } = useContext(AppContext);
  
  return (
    <div className={`responsive-wrapper ${deviceType}`}>
      {children}
    </div>
  );
}

export default ResponsiveWrapper;