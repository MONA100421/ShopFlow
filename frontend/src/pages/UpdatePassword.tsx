import { useState } from "react";
import type { FormEvent } from "react";
import SuccessModal from "../components/SuccessModal";

export default function UpdatePassword() {
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Update password</h1>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <div className="label">Email</div>
          <input type="email" required />
        </label>

        <button className="btn primary" type="submit">
          Update
        </button>
      </form>

      <SuccessModal
        open={open}
        onClose={() => setOpen(false)}
        title=""
        message="We have sent the update password link to your email, please check that!"
      />
    </div>
  );
}
