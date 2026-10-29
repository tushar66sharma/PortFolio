import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DRAWING_NO, profiles } from "../../site";
import { SectionHeader } from "../ui/SectionHeader";

const FIELD =
  "w-full border-[1.5px] border-line bg-paper px-3 py-2.5 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";

const toastOptions = () => ({
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
});

const ProfileRow = ({ profile }) => {
  const { platform, handle, url, Icon } = profile;
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-11 items-center gap-3 border-b border-dashed border-line py-2 no-underline"
      >
        <Icon aria-hidden="true" className="size-4 shrink-0 text-line transition-colors group-hover:text-accent" />
        <span className="w-24 shrink-0 text-[10.5px] uppercase tracking-[0.14em] text-muted">{platform}</span>
        <span className="truncate transition-colors group-hover:text-accent">
          {handle} <span aria-hidden="true">↗</span>
        </span>
      </a>
    </li>
  );
};

export const Contact = () => {
  const form = useRef();
  const [sending, setSending] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setSending(true);

    emailjs
      .sendForm(
        "service_f7oaimq", // EmailJS Service ID
        "template_6g9gonj", // EmailJS Template ID
        form.current,
        "oJY8R8h4jJnI9xdch" // EmailJS Public Key
      )
      .then(
        () => {
          form.current.reset();
          toast.success("Message sent successfully! ✅", toastOptions());
        },
        (error) => {
          console.error("Error sending message:", error);
          toast.error("Failed to send message. Please try again.", toastOptions());
        }
      )
      .finally(() => setSending(false));
  };

  return (
    <section id="contact" className="border-t-2 border-line px-5 py-8 sm:px-8 sm:py-10">
      <ToastContainer />

      <SectionHeader
        tag="TRANSMITTAL"
        title="Contact"
        intro="I’d love to hear from you—reach out for any opportunities or questions!"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="min-w-0">
          <p className="max-w-[46ch] text-muted">Send a transmittal and I&apos;ll reply by email. You can also find me here:</p>
          <ul className="mt-4">
            {profiles.map((profile) => (
              <ProfileRow key={profile.id} profile={profile} />
            ))}
          </ul>
        </div>

        <form ref={form} onSubmit={sendEmail} className="min-w-0 border-[1.5px] border-line bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-line px-4 py-2.5">
            <span className="bp-label">TRANSMITTAL NO. {DRAWING_NO}-T</span>
            <span className="bp-label">FOR: T. SHARMA</span>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <label htmlFor="contact-email" className="flex flex-col gap-1.5">
              <span className="bp-label">FROM (EMAIL)</span>
              <input id="contact-email" type="email" name="user_email" placeholder="Your Email" required autoComplete="email" className={FIELD} />
            </label>
            <label htmlFor="contact-name" className="flex flex-col gap-1.5">
              <span className="bp-label">NAME</span>
              <input id="contact-name" type="text" name="user_name" placeholder="Your Name" required autoComplete="name" className={FIELD} />
            </label>
            <label htmlFor="contact-subject" className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="bp-label">SUBJECT</span>
              <input id="contact-subject" type="text" name="subject" placeholder="Subject" required className={FIELD} />
            </label>
            <label htmlFor="contact-message" className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="bp-label">MESSAGE</span>
              <textarea id="contact-message" name="message" placeholder="Message" rows="5" required className={`${FIELD} resize-y`} />
            </label>
            <button type="submit" disabled={sending} className="bp-btn w-full disabled:cursor-wait disabled:opacity-70 sm:col-span-2">
              {sending ? "SENDING…" : "SEND TRANSMITTAL"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
