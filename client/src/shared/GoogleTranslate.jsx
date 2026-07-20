import React, { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    const addScript = () => {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'fr', 
          includedLanguages: 'en,ar,fr', 
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
      console.log('Google Translate initialized');
    };

    window.translatePage = (langCode) => {
      console.log('Translating to:', langCode);
      const targetLang = langCode === 'tn' ? 'ar' : langCode;
      
      const trigger = () => {
        const select = document.querySelector('.goog-te-combo');
        console.log('Found select element:', select);
        if (select) {
          select.value = targetLang;
          select.dispatchEvent(new Event('change'));
          localStorage.setItem('google_lang', langCode);
          console.log('Translation triggered for:', targetLang);
        } else {
          console.log('Google Translate widget not ready, retrying...');
          setTimeout(trigger, 500);
        }
      };
      
      trigger();
    };

    const savedLang = localStorage.getItem('google_lang');
    if (savedLang) {
      setTimeout(() => {
        console.log('Applying saved language:', savedLang);
        window.translatePage(savedLang);
      }, 2000);
    }

    if (!window.google || !window.google.translate) {
      console.log('Loading Google Translate script...');
      addScript();
    } else {
      console.log('Google Translate already loaded');
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <>
      <style>{`
        #google_translate_element, .skiptranslate, .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .goog-tooltip, .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
    </>
  );
};

export default GoogleTranslate;
