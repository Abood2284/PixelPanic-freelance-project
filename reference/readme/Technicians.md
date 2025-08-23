# The Technician's Identity & Purpose

At its core, a technician is the physical embodiment of the PixelPanic brand. They are the primary human touchpoint for the customer after the initial online booking. Their role is not just to perform a repair, but to deliver on the brand's promise of trust, speed, and professionalism.

As a User: In our system, they are a specialized user with the 'technician' role. This gives them a unique set of permissions and a dedicated interface, separate from customers and admins.

As an Employee/Contractor: They are a trusted agent of the company, equipped with the necessary skills, tools, and parts to complete a job successfully.

## Control & Permissions (The Admin's Role)

Your point about admins controlling credentials is spot on. This is crucial for security and operational control.

- **Lifecycle Management**: Admins control the entire lifecycle of a technician account:

- **Onboarding**: Creating their user profile and login credentials.

- **Assignment**: Assigning specific orders (gigs) to available technicians. This is the primary day-to-day control mechanism.

- **Monitoring**: Viewing a technician's status (active, on_leave), current workload, and performance metrics (ratings, completion times).

- **Offboarding**: Revoking access instantly. I'd suggest we deactivate a technician's account rather than deleting it. This preserves their history, which is vital for sales records and any future disputes.

## The Technician's Power & Workflow (What They Control)

The technician needs just enough power to do their job efficiently without creating risk. Their workflow revolves around the "gig" or order.

When a technician logs into their dashboard, their entire world should be about managing their assigned orders for the day.

A Typical Workflow:

+ **Start of Day**: The technician logs in and sees a clear queue of their assigned gigs for the day, likely sorted by the customer's chosen time slot.

+ **Select a Gig**: They tap on the first gig in their queue.

+ **View Details**: They see all necessary information:

    + Order ID

    + Customer Name, Address, and Phone Number

    + A "Navigate" button that opens Google/Apple Maps with the destination pre-filled.

    + The device (e.g., iPhone 15 Pro) and the specific issue (e.g., Screen Replacement).

    + The parts they should have on hand for the job.

+ **Update Status**: This is their primary "power." They manually push the order through its stages:

    + The order starts as Confirmed.

    + When they arrive and begin work, they tap a button to change the status to In Progress.

    + Once the repair is finished and the customer is satisfied, they change the status to Completed. The PRD mentions an "OTP close-out" from the customer to verify this step, which is a fantastic idea for ensuring trust.
