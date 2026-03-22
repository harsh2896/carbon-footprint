import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
import { Link, Navigate } from 'react-router-dom';
import Auth from '../utils/auth';
import backgroundImage from './assets/images/right-blue-blue.png';

const shellClasses =
  'relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8';
const panelClasses =
  'relative z-10 flex w-full max-w-[420px] flex-col items-center rounded-[20px] border border-white/20 bg-white/15 px-8 py-10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]';
const inputClasses =
  'w-full rounded-xl border border-[rgba(36,59,74,0.4)] bg-white/25 px-5 py-4 text-[1.05rem] text-[var(--text-primary)] outline-none backdrop-blur-[6px] transition duration-200 placeholder:text-white/65 focus:scale-[1.015] focus:bg-white/35 focus:shadow-[0_0_0_4px_rgba(255,255,255,0.2)]';
const buttonClasses =
  'mt-2 rounded-xl bg-[var(--dark-blue)] px-4 py-4 text-[1.1rem] font-semibold text-[var(--white)] transition duration-300 hover:-translate-y-[3px] hover:bg-[var(--light-blue)] hover:text-[var(--dark-blue)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.2)]';

const Signup = () => {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [addUser, { error }] = useMutation(ADD_USER);

  if (Auth.loggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }

  // update state based on form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // submit form
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    // use try/catch instead of promises to handle errors
    try {
      const { data } = await addUser({
        variables: { ...formState },
      });

      Auth.login(data.addUser.token, '/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className={shellClasses}>
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className={panelClasses}>
        <h1 className="mb-7 text-center text-[2.2rem] font-bold tracking-[-0.5px] text-[var(--dark-blue)]">Sign Up</h1>
        <form className="flex w-full flex-col gap-[1.2rem]" onSubmit={handleFormSubmit}>
          <input
            className={inputClasses}
            placeholder="Your username"
            name="username"
            type="username"
            id="username"
            value={formState.username}
            onChange={handleChange}
          />
          <input
            className={inputClasses}
            placeholder="Your email"
            name="email"
            type="email"
            id="email"
            value={formState.email}
            onChange={handleChange}
          />
          <input
            className={inputClasses}
            placeholder="******"
            name="password"
            type="password"
            id="password"
            value={formState.password}
            onChange={handleChange}
          />
          <button className={buttonClasses} type="submit">Submit</button>
          {error && <p className="min-h-[1.3rem] rounded-lg bg-red-400/10 p-2.5 text-center text-[0.95rem] font-medium text-red-400">Sign up failed</p>}
        </form>
        <p className="mt-6 text-center text-[1.05rem] text-[var(--text-primary)]/90">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--light-blue)] underline transition duration-200 hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;
