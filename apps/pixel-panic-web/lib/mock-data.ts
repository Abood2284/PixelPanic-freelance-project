// Mock data for development testing
// This file should only be used in development mode

export const mockTechnicianGigs = [
  {
    id: 1001,
    status: "confirmed",
    timeSlot: "10:00 AM - 12:00 PM",
    address: {
      fullName: "Rahul Sharma",
      flatAndStreet: "Flat 302, Sunshine Apartments, Andheri West",
      pincode: "400058",
    },
    orderItems: [
      {
        issueName: "Screen Replacement",
        modelName: "iPhone 15 Pro",
      },
    ],
  },
  {
    id: 1002,
    status: "in_progress",
    timeSlot: "2:00 PM - 4:00 PM",
    address: {
      fullName: "Priya Patel",
      flatAndStreet: "House 45, Green Valley Society, Bandra East",
      pincode: "400051",
    },
    orderItems: [
      {
        issueName: "Battery Replacement",
        modelName: "Samsung Galaxy S24",
      },
    ],
  },
  {
    id: 1003,
    status: "confirmed",
    timeSlot: "6:00 PM - 8:00 PM",
    address: {
      fullName: "Amit Kumar",
      flatAndStreet: "Flat 15, Royal Heights, Juhu",
      pincode: "400049",
    },
    orderItems: [
      {
        issueName: "Charging Port Repair",
        modelName: "OnePlus 12",
      },
    ],
  },
];

export const mockGigDetails = {
  id: 1001,
  status: "confirmed",
  timeSlot: "10:00 AM - 12:00 PM",
  address: {
    fullName: "Rahul Sharma",
    flatAndStreet: "Flat 302, Sunshine Apartments, Andheri West",
    pincode: "400058",
    phone: "+91 98765 43210",
  },
  orderItems: [
    {
      issueName: "Screen Replacement",
      modelName: "iPhone 15 Pro",
      price: 8500,
      parts: ["OEM Screen", "Adhesive Kit", "Screws"],
    },
  ],
  notes:
    "Customer mentioned screen has deep scratches and touch not working properly",
  photos: [],
};

// Mock gig details for different IDs
export const getMockGigDetails = (id: number) => {
  const gigs = {
    1001: {
      ...mockGigDetails,
      id: 1001,
      status: "confirmed" as const,
    },
    1002: {
      ...mockGigDetails,
      id: 1002,
      status: "in_progress" as const,
      address: {
        fullName: "Priya Patel",
        flatAndStreet: "House 45, Green Valley Society, Bandra East",
        pincode: "400051",
        phone: "+91 87654 32109",
      },
      orderItems: [
        {
          issueName: "Battery Replacement",
          modelName: "Samsung Galaxy S24",
          price: 3200,
          parts: ["OEM Battery", "Adhesive Kit"],
        },
      ],
      notes: "Customer reports battery drains quickly and phone gets hot",
    },
    1003: {
      ...mockGigDetails,
      id: 1003,
      status: "completed" as const,
      address: {
        fullName: "Amit Kumar",
        flatAndStreet: "Flat 15, Royal Heights, Juhu",
        pincode: "400049",
        phone: "+91 76543 21098",
      },
      orderItems: [
        {
          issueName: "Charging Port Repair",
          modelName: "OnePlus 12",
          price: 1800,
          parts: ["Charging Port", "Screws"],
        },
      ],
      notes:
        "Charging port was loose and not charging properly. Replaced with new port.",
      photos: [
        {
          id: 1,
          url: "https://via.placeholder.com/300x200?text=Before+Repair",
        },
        { id: 2, url: "https://via.placeholder.com/300x200?text=After+Repair" },
      ],
    },
  };

  return gigs[id as keyof typeof gigs] || gigs[1001];
};
