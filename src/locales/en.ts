const en = {
  welcome: "Welcome",
  header: {
    logo: "Logo",
    nav: {
      home: "Home",
      about: "About Us",
      projects: "Gallery",
      companies: "Companies",
      brands: "Brands",
      news: "News",
      contact: "Contact",
      services: "Services",
      store: "Store"
    },
    cta: "Contact Us",
  },
  serviceList: {
    title: "Our Services",
    loading: "Loading services...",
    error: "Error loading services. Please try again later.",
  },
  // Agregamos las traducciones para el componente ProjectGrid
  ProjectGrid: {
    title: "Our Projects",
    seeAll: "See All Our Projects"
  },
  hero: {
    bigTitlePart1: "Doors",
    bigTitlePart2: "Kitchens",
    bigTitlePart3: "Furniture for Large Projects",
    stats: {
      factorySize: "39,027 ft2",
      factory: "Factory",
      experience: "48+ Years",
      experienceSubtitle: "of experience",
      territory: "Territory",
      territorySubtitle: "National | International",
    },
  },
  footer: {
    nav: {
      terms: "Terms & Conditions",
      privacy: "Privacy Policy"
    },
    social: {
      instagram: "Instagram",
      facebook: "Facebook"
    },
    copy: "All rights reserved."
  },
  storeSection: {
    loading: "Loading featured products...",
    error: "Error loading featured products. Please try again later.",
    featuredTitle: "Featured Boards",
    featuredSubtitle: "High quality selection of boards for carpentry and ebanistería.",
    viewMore: "View More"
  },
  storePage: {
    loading: "Loading products...",
    error: "Error loading products. Please try again later.",
    title: "Store",
    featured: "Featured",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    name: "Name",
  },
  aboutUs: {
    title: "About ROMAna Ebanistería",
    paragraph1: "With over 48 years of experience, we take pride in being the largest aluminum carpentry and ebanistería factory in La Romana.",
    paragraph2: "We collaborate with real estate developers, hotel chains, and high-level residential projects, providing comprehensive and customized solutions.",
  },
  whyUs: {
    heading: "Why choose ROMAna Ebanistería?",
    reasons: [
      {
        title: "Personalized Attention",
        description:
          "Each project receives a unique approach, tailored to the style and needs of every client, ensuring custom-made results.",
      },
      {
        title: "Constant Innovation",
        description:
          "We use state-of-the-art machinery and modern materials (melamine, MDF, aluminum), guaranteeing quality and durability.",
      },
      {
        title: "Comprehensive Solutions",
        description:
          "From design and manufacturing to installation and maintenance, we cover the entire project cycle to provide a seamless experience.",
      },
      {
        title: "Commitment and Guarantee",
        description:
          "Every piece is backed by our rigorous quality control and a dedicated after-sales service, reflecting our seriousness and professionalism.",
      },
    ],
  },
  ctaSection: {
    title: "Discover Our Store",
    subTitle: "Find high-quality cabinetry, aluminum carpentry, and accessories in one place.",
    buttonText: "Go to the Store"
  },
  galleryHero: {
    heading: "Explore Our Projects"
  },
  contactForm: {
    heading: "Request Your Quote",
    subheading: "Leave us your details and one of our advisors will get in touch with you as soon as possible.",
    placeholders: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "Message",
    },
    validationErrors: {
      nameRequired: "Name is required",
      lastNameRequired: "Last name is required",
      emailInvalid: "Invalid email address",
      emailRequired: "Email address is required",
      phoneInvalid: "Invalid phone number",
      phoneRequired: "Phone number is required",
      messageMinLength: "Message must be at least 10 characters",
      messageRequired: "Message is required",
    },
    notifications: {
      success: "Request sent successfully. We will contact you soon.",
      processErrorDefault: "Your request could not be processed.",
      generalError: "An error occurred while sending your request. Please try again.",
    },
    buttonText: "Send Inquiry",
    sendingText: "Sending...",
    disclaimers: {
      location: "We serve projects nationwide",
      responseTime: "We resolve inquiries within 24-48 hours",
    },
  },
  contactInfo: {
    heading: "Contact Us",
    subheading: "If you need advice, quotes, or more information about our services, we are ready to help.",
    emailLabel: "Email Address",
    phoneLabel: "Phone | WhatsApp",
    scheduleLabel: "Office Hours",
    schedule1: "Monday - Friday: 8:00 AM - 6:00 PM",
    schedule2: "Saturdays: 8:00 AM - 1:00 PM",
  },
  locationSection: {
    heading: "Our Location",
    subheading: "Discover our showroom and factory in the heart of La Romana",
    showroomHeading: "Showroom & Factory",
    companyTitle: "ROMAna Ebanistería",
    addressLine1: "Calle 4, No. 7, Sector Reparto Torres",
    addressLine2: "La Romana, Dominican Republic",
    visitMessage: "We serve customers throughout the eastern region and nationwide. Visit us to learn more about our facilities and cabinetry solutions.",
    howToGetThere: "Get Directions",
  },
  serviceDetail: {
    backToServices: "Back to services",
    description: "Description",
    category: "Category",
    estimatedDuration: "Estimated duration",
    availability: "Availability",
    requestQuote: "Request quote",
    imageAlt: "image", // Used in the alt text with number: "image 1", "image 2", etc.
  },
  quoteRequest: {
    notFound: {
      title: "Service not found",
      message: "Sorry, we couldn't find the requested service.",
      backHome: "Back to home"
    },
    form: {
      title: "Request Quote",
      subtitle: "Complete the form to receive a personalized quote",
      formIntro: "Complete the form and you will receive a personalized quote for",
      requiredFields: "Fields marked with an asterisk (*) are required to correctly process your request.",
      fields: {
        fullName: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        company: "Company / Project (optional)",
        projectDescription: "Project Description",
        projectDescriptionPlaceholder: "Briefly describe your project and specific needs..."
      },
      validation: {
        fullName: "Full name is required",
        email: "Invalid email",
        emailRequired: "Email is required",
        phone: "Phone number is required",
        projectDescription: "Project description is required"
      },
      sending: "Sending...",
      submit: "Request Quote Now",
      privacyPolicy: "By submitting this form, you agree to our privacy policy and terms of service.",
      success: {
        title: "Request sent successfully",
        message: "Thank you for your interest. We will contact you shortly to discuss your project details."
      },
      error: {
        title: "Error sending request",
        message: "An error occurred while sending the request. Please try again later."
      },
      trust: {
        title: "Why request a quote with us?",
        fastResponse: "Guaranteed quick response",
        customQuotes: "Custom quotes tailored to your needs",
        experiencedProfessionals: "Experienced professionals"
      }
    }
  },
};
export default en;
