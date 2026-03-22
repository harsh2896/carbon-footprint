import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME } from '../../utils/queries';
import { ADD_PLEDGE } from '../../utils/mutations';
import Auth from '../../utils/auth';

const Pledges = () => {
  const isLoggedIn = Auth.loggedIn();
  const { data, loading } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  const pledges = data?.me?.pledges || [];

  const [formState, setFormState] = useState({
    title: '',
    description: '',
  });

  // add pledge mutation
  const [addPledge, { loading: saving }] = useMutation(ADD_PLEDGE, {
    refetchQueries: [{ query: QUERY_ME }],
    awaitRefetchQueries: true,
  });

  // function to handle saving a pledge to our database
  const handleSavedPledge = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      alert('Please login to add a pledge');
      return;
    }

    try {
      console.log('Submitting pledge:', formState);
      await addPledge({ variables: { ...formState } });
      setFormState({ title: '', description: '' });
      alert('Pledge added successfully!');
    } catch (err) {
      console.error(err);
      alert('Unable to add pledge. Please login.');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({ ...formState, [name]: value });
  };

  return (
    <div className="grid gap-6 p-5">
      <form
        className="mx-auto grid w-full max-w-[500px] gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_8px_25px_rgba(0,0,0,0.2)] backdrop-blur-xl"
        onSubmit={handleSavedPledge}
      >
        <h2 className="mb-2 text-2xl font-bold text-[var(--text-color)]">Create a Pledge</h2>
        <input
          className="w-full rounded-[10px] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-3 text-[var(--input-text)] outline-none transition focus:ring-2 focus:ring-emerald-400/40"
          name="title"
          type="text"
          placeholder="Enter your pledge title"
          value={formState.title}
          onChange={handleChange}
        />
        <textarea
          className="min-h-[120px] w-full resize-y rounded-[10px] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-3 text-[var(--input-text)] outline-none transition focus:ring-2 focus:ring-emerald-400/40"
          name="description"
          placeholder="Write your pledge description..."
          value={formState.description}
          onChange={handleChange}
        />
        <button
          className="w-full rounded-[10px] bg-emerald-500 px-3 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Add Pledge'}
        </button>
      </form>

      <h3 className="text-center text-2xl font-semibold text-[var(--text-color)]">Your pledges</h3>
      {loading ? (
        <p className="text-center text-[var(--text-muted)]">Loading pledges...</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {pledges.length ? (
            pledges.map((pledge) => (
              <div
                className="min-w-[220px] max-w-[320px] rounded-2xl bg-white/10 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.15)]"
                key={pledge._id}
              >
                <h3 className="mb-2 text-[1.1rem] font-semibold text-[var(--text-color)]">{pledge.title}</h3>
                <p className="text-[var(--text-muted)]">{pledge.description}</p>
              </div>
            ))
          ) : (
            <p className="text-[var(--text-muted)]">No pledges yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Pledges;
