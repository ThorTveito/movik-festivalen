import Marquee from "react-fast-marquee";
import './Banner.css';
import ElefantSVG from '../assets/ElefantSVG.svg';

export const Banner = () => {
  return (
    <div className="banner">
      <Marquee speed={50} gradient={false} pauseOnHover={true}>
        <p className="banner-text">
          MovikFestivalen • 10. - 12. Juli 2026 • Nøtterøy
        </p>
        <img src={ElefantSVG} alt="Elephant" className="banner-icon" />
        <p className="banner-text">
          MovikFestivalen • 10. - 12. Juli 2026 • Nøtterøy
        </p>
        <img src={ElefantSVG} alt="Elephant" className="banner-icon" />
        <p className="banner-text">
          MovikFestivalen • 10. - 12. Juli 2026 • Nøtterøy
        </p>
        <img src={ElefantSVG} alt="Elephant" className="banner-icon" />
      </Marquee>
    </div>
  );
};
