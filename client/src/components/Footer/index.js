import React from 'react';
import Logo from '../Navbar/images/logo.png';
import Auth from '../../utils/auth';

function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--footer-bg)] px-4 py-6 font-bold text-[var(--footer-text)] transition-[background-color,color] duration-200">
      <section className="mx-auto flex max-w-7xl flex-wrap justify-between gap-8 px-2.5 max-[480px]:items-center max-[480px]:justify-center">
        <section className="flex flex-wrap justify-start gap-4 leading-[1.5]">
          <img
            className="h-20"
            src={Logo}
            alt="logo of a foot oultine with the earth inside it"
          ></img>
          <div>
            <h3 className="text-xl font-extrabold">
              Carbon <span className="font-extrabold text-[var(--footer-accent)]">Footprint</span>
            </h3>
            <ul className="list-none">
              <li className="text-sm leading-[1.7]">
                <a className="font-semibold text-[var(--footer-link)] no-underline transition duration-200 hover:text-[var(--footer-link-hover)]" href={Auth.loggedIn() ? '/profile' : '/login'}>
                  {Auth.loggedIn() ? 'Profile' : 'Login'}
                </a>
              </li>
              <li className="text-sm leading-[1.7]">
                <a
                  className="font-semibold text-[var(--footer-link)] no-underline transition duration-200 hover:text-[var(--footer-link-hover)]"
                  href="https://github.com/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Github Repository
                </a>
              </li>
              <li className="text-sm leading-[1.7]">
                <a className="font-semibold text-[var(--footer-link)] no-underline transition duration-200 hover:text-[var(--footer-link-hover)]" href="/donation">Fight Climate Change</a>
              </li>
              <li className="text-sm leading-[1.7]">
                <h3>Contect Details:</h3>
                <ul className="list-none">
                  <li className="text-sm leading-[1.7]">Mobile Number : +91 9875648795</li>
                  <li className="text-sm leading-[1.7]">Email : harsh2026@gmail.com</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>
        <section className="flex flex-col justify-end max-[480px]:mt-5">
          <div>
            &copy; 2026 Carbon <span className="font-extrabold text-[var(--footer-accent)]">Footprint</span>
          </div>
        </section>
      </section>
    </footer>
  );
}

export default Footer;
