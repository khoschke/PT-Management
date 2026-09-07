"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Trainer } from "@/lib/types";
import AvailabilityPicker from "../../components/AvailabilityPicker";
import SpecialtyPicker from "../../components/SpecialtyPicker";
import { focusRing } from "../../components/ui";
import { updateMyProfile } from "../actions";
import { initialProfileFormState } from "../state";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`press self-start rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}
    >
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

export default function MyProfileForm({ trainer }: { trainer: Trainer }) {
  const [state, formAction] = useActionState(updateMyProfile, initialProfileFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="mt-6 max-w-2xl rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">Edit my profile</h2>
      <p className="mt-0.5 text-xs text-secondary-label">
        Yours to keep current. Changes save straight away, no need to go through the PT Manager.
      </p>

      {state.status === "success" && state.message && (
        <div className="mt-3 rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700" role="status">
          {state.message}
        </div>
      )}
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">
          {state.message}
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm font-semibold text-foreground">Availability</label>
        <p className="mt-0.5 text-xs text-secondary-label">
          The times you take sessions. Leads are matched to this, so keep it honest — if you stop taking evenings,
          untick Evening and you&rsquo;ll stop being suggested for members who want one.
        </p>
        <AvailabilityPicker defaults={trainer} />
        {errors.availability && <p className="mt-1 text-xs text-red-600">{errors.availability}</p>}
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-foreground">Specialties</label>
        <p className="mt-0.5 text-xs text-secondary-label">
          These aren&rsquo;t just for show. New leads are matched to trainers on these tags, so ticking one makes you
          more likely to be suggested for a member chasing that goal.
        </p>
        <SpecialtyPicker selected={trainer.specialties} />
      </div>

      <div className="mt-4">
        <label htmlFor="bio" className="text-sm font-semibold text-foreground">
          About me
        </label>
        <p className="mt-0.5 text-xs text-secondary-label">
          Anything the tags don&rsquo;t cover, e.g. boxing, kettlebells, pre/post-natal, rehab, certifications, how you
          coach. The PT Manager sees this when allocating leads.
        </p>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={trainer.bio ?? ""}
          maxLength={1000}
          className={`${inputClass} resize-y`}
        />
        {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio}</p>}
      </div>

      <div className="mt-4">
        <SaveButton />
      </div>
    </form>
  );
}
