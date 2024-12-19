"use client";
import { useEffect, useState } from "react";

const CaptchaApp = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sequence, setSequence] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaResolved, setCaptchaResolved] = useState(false);

  useEffect(() => {
    const chargerScript = () => {
      const script = document.createElement("script");
      script.src =
        "https://b82b1763d1c3.eu-west-3.captcha-sdk.awswaf.com/b82b1763d1c3/jsapi.js";
      script.type = "text/javascript";
      script.defer = true;
      script.addEventListener("load", () => setScriptLoaded(true));
      document.head.appendChild(script);
    };

    if (typeof window !== "undefined" && !scriptLoaded) {
      chargerScript();
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (
      scriptLoaded &&
      typeof window !== "undefined" &&
      window.AwsWafCaptcha
    ) {
      window.afficherMonCaptcha = function () {
        const conteneur = document.querySelector("#mon-conteneur-captcha");

        window.AwsWafCaptcha.renderCaptcha(conteneur, {
          apiKey: process.env.NEXT_PUBLIC_WAF_API_KEY,
          onSuccess: (wafToken) => {
            setCaptchaResolved(true);
          },
          onError: (error) => {
            console.error("Erreur Captcha:", error);
          },
        });
      };
    }
  }, [scriptLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const N = parseInt(inputValue, 10);
    if (isNaN(N) || N < 1 || N > 1000) {
      alert("Veuillez entrer un nombre valide entre 1 et 1000.");
      return;
    }
    setSequence([]);
    setIsLoading(true);

    for (let i = 1; i <= N; i++) {
      if (!captchaResolved) {
        window.afficherMonCaptcha && window.afficherMonCaptcha();
        break;
      }
      try {
        await fetch("https://api.prod.jcloudify.com/whoami");
        setSequence((prev) => [...prev, `${i}. Interdit`]);
      } catch (error) {
        console.error(`Erreur sur la requête ${i}:`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ marginBottom: '20px' }}>Application Séquence avec Captcha</h1>
      {sequence.length === 0 && !isLoading && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ marginBottom: '10px' }}>
            Entrez un nombre (1-1000):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </label>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Soumettre</button>
        </form>
      )}
      {sequence.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {sequence.map((ligne, index) => (
            <p key={index} style={{ marginBottom: '10px' }}>{ligne}</p>
          ))}
        </div>
      )}
      <div id="mon-conteneur-captcha" />
    </div>
  );
};

export default CaptchaApp;
