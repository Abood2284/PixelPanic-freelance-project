"use client";

import { MapPin, Phone, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact-forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
        id?: number;
        errors?: Record<string, string[]>;
      };

      if (response.ok && result.success) {
        toast.success(result.message);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(", ");
          toast.error(errorMessages);
        } else {
          toast.error(result.message || "Failed to send message");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while sending your message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-black/90"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Get in <span className="text-orange-400">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ready to fix your device? We're here to help with all your repair
            needs. Visit our shop or reach out to us today.
          </p>
        </div>
      </section>

      {/* Contact Information & Map */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Located in the heart of Mumbai, our repair shop is easily
                  accessible and ready to serve all your device repair needs.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                {/* Address */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-2">
                          Our Location
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          Shop No. 58, Heera Panna Shopping Centre,
                          <br />
                          Bhulabhai Desai Marg, Malviya Marg,
                          <br />
                          Haji Ali, Mumbai, Maharashtra 400026, India
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-2">
                          Phone Number
                        </h3>
                        <a
                          href="tel:+919326108547"
                          className="text-slate-600 hover:text-orange-600 transition-colors text-lg font-medium"
                        >
                          +91 93261 08547
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Hours */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-2">
                          Business Hours
                        </h3>
                        <div className="text-slate-600 space-y-1">
                          <p>Monday: 11:00 AM - 9:30 PM</p>
                          <p>Tuesday: 11:00 AM - 9:30 PM</p>
                          <p>Wednesday: 11:00 AM - 9:30 PM</p>
                          <p>Thursday: 11:00 AM - 9:30 PM</p>
                          <p>Friday: 11:00 AM - 9:30 PM</p>
                          <p>Saturday: 11:00 AM - 9:30 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Find Us
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Visit our shop in the vibrant Heera Panna Shopping Centre,
                  conveniently located near Haji Ali.
                </p>
              </div>

              {/* Map Container */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] w-full">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5234567890123!2d72.8105105!3d18.977641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60bc1c9f5effc9f5:0xcc18f1633572be5f!2sPixel%20Panic%20-%20Doorstep%20Mobile%20Repair!5e0!3m2!1sen!2sin!4v1672531200000"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              {/* Directions */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3">
                    How to Reach Us
                  </h3>
                  <div className="space-y-2 text-slate-600">
                    <p>
                      • <strong>By Bus:</strong> Take bus routes 1, 2, 3 to Haji
                      Ali stop
                    </p>
                    <p>
                      • <strong>By Train:</strong> Nearest station is Mahalaxmi
                      (Western Line)
                    </p>
                    <p>
                      • <strong>By Car:</strong> Parking available at Heera
                      Panna Shopping Centre
                    </p>
                    <p>
                      • <strong>By Auto:</strong> 10-minute ride from Mahalaxmi
                      station
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Send Us a Message
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Have a question or need a quote? Fill out the form below and we'll
              get back to you within 24 hours.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        className="w-full"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        className="w-full"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      className="w-full"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your repair needs..."
                      className="w-full min-h-[120px] resize-none"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Don't wait! Bring your device to our shop today and let our expert
            technicians get it working like new again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
              onClick={() => window.open("tel:+919326108547", "_self")}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
              onClick={() =>
                window.open(
                  "https://maps.google.com/maps?q=Pixel+Panic+-+Doorstep+Mobile+Repair,+Heera+Panna+Shopping+Centre,+Haji+Ali,+Mumbai,+Maharashtra+400026,+India",
                  "_blank"
                )
              }
            >
              <MapPin className="w-5 h-5 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
