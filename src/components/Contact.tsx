import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("https://formsubmit.co/ajax/contact@hosconstructiontx.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          _subject: `New inquiry from ${form.name}`,
        }),
      });
      if (res.ok) {
        toast({ title: "Message Sent!", description: "We'll get back to you shortly." });
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-secondary overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="uppercase tracking-[0.3em] text-primary text-xs font-semibold mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-5xl font-bold uppercase text-secondary-foreground">Contact Us</h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-20 h-1 bg-primary mx-auto mt-5 origin-left"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <p className="text-secondary-foreground/70 leading-relaxed text-base">
              Ready to start your next project? Reach out and let's discuss how HOS Construction
              can bring your vision to life.
            </p>
            <div className="space-y-6">
              {[
                { icon: Phone, text: "281-928-9967", href: "tel:2819289967" },
                { icon: Mail, text: "contact@hosconstructiontx.com", href: "mailto:contact@hosconstructiontx.com" },
                { icon: MapPin, text: "Houston, TX", href: undefined },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-secondary-foreground/80">{item.text}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {[
              { type: "text", placeholder: "Your Name", key: "name", required: true, maxLength: 100 },
              { type: "email", placeholder: "Email Address", key: "email", required: true, maxLength: 255 },
              { type: "tel", placeholder: "Phone Number", key: "phone", required: false, maxLength: 20 },
            ].map((field) => (
              <input
                key={field.key}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full bg-secondary-foreground/5 border border-secondary-foreground/10 text-secondary-foreground placeholder:text-secondary-foreground/40 px-5 py-4 text-sm focus:outline-none focus:border-primary transition-all duration-300 rounded-sm"
              />
            ))}
            <textarea
              placeholder="Tell us about your project..."
              required
              maxLength={1000}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-secondary-foreground/5 border border-secondary-foreground/10 text-secondary-foreground placeholder:text-secondary-foreground/40 px-5 py-4 text-sm focus:outline-none focus:border-primary transition-all duration-300 resize-none rounded-sm"
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-sm px-8 py-4 hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-sm"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
