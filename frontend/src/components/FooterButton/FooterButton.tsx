import type { FC } from 'react';
import { useState, useEffect } from 'react';

import './FooterButton.css';

interface FooterButtonProps {
  buttonText: string;
  active: boolean;
}

export const FooterButton: FC<FooterButtonProps> = ({ buttonText, active }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
    }
  }, []);

  return (
    <div className={`footer ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="containerbutton">
        <div className={active ? "footerbutton" : "footerbutton-disable"} aria-disabled={!active}>
          {buttonText}
        </div>
      </div>
    </div>
  );
};
