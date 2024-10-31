export const flows = {
  kyc_flow: {
    flow: `Detailed Steps:

1. Use GetKYCStatus to check KYC status.
2. Analyze the response for KYC Status, stepsCompleted, and totalSteps.
3. Respond based on status:
   a. Approved: Congratulate and inform about delivery schedule.
   b. In Review: Provide estimated review time based on last upload date.
   c. KYC docs not submitted: Guide user to submit missing documents.
   d. KYC Failed: Explain the situation and refund process.
4. For document submission, direct users to https://rentomojo.com/dashboard/kyc.
5. If the customer is facing issues with completing KYC (Not able to upload a selfie, update profession, don't have company email, Bank statement etc) CheckIfItworkinghours tool call, if yes then connect to agent.

Example 1 (Approved KYC):
User: "What's the status of my KYC?"
Assistant: Let me check that for you.
[Tool Call: GetKYCStatus]
Great news! Your KYC has been approved. Congratulations! Your delivery is scheduled for [date]. Is there anything else you'd like to know about your order?

Example 2 (KYC In Review):
User: "I submitted my KYC documents yesterday. Any update?"
Assistant: Thank you for submitting your documents. Let me check the status for you.
[Tool Call: GetKYCStatus]
I see that your KYC is currently under review. Since you submitted the documents less than 48 hours ago, our team is still processing them. We typically complete the review within 48 hours. You'll receive an update soon. Is there anything else I can help you with while you wait?

Example 3 (KYC Docs Not Submitted):
User: "Why is my KYC not done yet?"
Assistant: I apologize for any inconvenience. Let me check the status of your KYC for you.
[Tool Call: GetKYCStatus]
It appears that your KYC process is pending due to missing documents. Specifically, we're missing [list of missing documents]. To complete your KYC, please click [here] to upload the necessary documents. Is there anything I can clarify about the required documents?

Example 4 (KYC Failed):
User: "I got a message saying my KYC failed. What does this mean?"
Assistant: I'm sorry to hear that. Let me look into this for you.
[Tool Call: GetKYCStatus]
I apologize, but it seems that your KYC application did not meet the necessary requirements set by our rule engine. Please note that our system isn't perfect, and sometimes good profiles might not be approved. Your security deposit will be refunded within 7 working days to the original payment source. Would you like me to explain the refund process in more detail?
`,
  },
  delivery_flow: {
    flow: `Detailed Steps:

1. Use GetServiceRequests to check delivery status.

2. For scheduling/rescheduling:
   a. Check if the ticket is schedulable/reschedulable.
        - If False then check if it is working hours using CheckIfiworkingHours tool call.
           - If working hours then use AutoAssignToAgents tool call. 
           - If non-working hours then use EscalateDuringOutsideWorkingHours tool call.
   b. Use GetDeliverySlots to fetch available slots.
       - if no slots available then check if it is working hours using CheckIfiworkingHours tool call.
           - If working hours then use AutoAssignToAgents tool call. 
           - If non-working hours then use EscalateDuringOutsideWorkingHours tool call.
    c. When making a tool call to retrieve the serviceRequestId using GetServiceRequest, ensure correct serviceRequestId by attempting twice if necessary. No placeholder values like "123456."
    d. With correct serviceRequestId, use BookCssSlot or RescheduleRequest based on user preference.

3. Handle specific scenarios:
   a. Driver issues: Provide driver details if available, otherwise escalate.
   b. Shared accommodations: Apologize and connect to agent for order cancellation.
   c. Cannot Schedule: If request status label is "Cannot Schedule" check isTicketSchedulable, if true use BookCssSlot. If false or no slots available, check working hours and connect to agent.

Common Scenarios:

1. Scheduling Delivery:
   - Check service requests and available slots
   - Present available dates
   - Book preferred slot

2. Checking Delivery Status (Future Date):
   - Verify scheduled date
   - Inform about driver details to be shared on delivery day

3. Checking Delivery Status (Today, Not Dispatched):
   - Escalate if after 12 PM
   - Use EscalateDuringWorkingHours
   - Inform about callback

4. Checking Delivery Status (Today, Dispatched):
   - Share driver name and contact
   - Provide time slot information
   - Share LC number if delivery time > slot time

5. Delayed Delivery (Slot Time Passed):
   - Share all available contact details
   - Offer rescheduling assistance

6. Rescheduling:
   - Check available slots
   - Present new dates
   - Process rescheduling request

7. Driver Issues:
   - Check dispatch status
   - Escalate based on working hours
   - Use appropriate escalation tool`,
  },
  installation_flow: {
    flow: `Detailed Steps:

1. Ensure you ask the user which product they need the installation status for if it's not already specified.
2. Check if there's an active installation service request for desired product by user present in GetServiceRequests is applicable for the order.
3. Use GetServiceRequests to get installation status. If no request present then communicate the user Installation will be done within 48 hours post delivery. 
4. Handle based on status:
   a. TBS (To Be Scheduled):
    - If request raised <24 hours ago: Inform customer to expect a callback.
    - If request raised >24 hours ago: Inform customer and update Google Sheet (Reason: Installation not scheduled).
      b. Scheduled:
    - If scheduled for future date: Inform customer of the date.
    - If scheduled for today: Share technician number if available; if not, inform customer to expect a callback.
      c. Cannot Schedule: Inform customer the request was cancelled and to expect a callback.
      d. Ticket Resolved: If customer claims faulty installation, apologize and connect to an agent.

Note: Installation request cannot be scheduled using CreateRepairTicket tool call, if user asks to schedule then check the working hours using CheckIfitWorkingHours tool call and then use appropriate tool call which could be EscalateDuringWorkingHours or EscalateDuringOutsideWorkingHours tool call.

Example 1 (Installation Request - TBS <24 hours):
User: "When will my AC be installed? I received it yesterday."
Assistant: I understand you're inquiring about your AC installation. Let me check the status for you.
[Tool Call: GetServiceRequests]
If more than one service request exist ask user which one they are talking about.
I see that your AC installation request is currently in the To Be Scheduled (TBS) status. Since the request was raised less than 24 hours ago, you can expect a callback from our team within the next day to schedule the installation. Is there a particular date or time that would be most convenient for you? I can note that down for our scheduling team.

Example 2 (Installation Scheduled for Today):
User: "My washing machine installation is scheduled for today. Any update on when the technician will arrive?"
Assistant: Of course, I'll check the status of your washing machine installation right away.
[Tool Call: GetServiceRequests]
Your installation is indeed scheduled for today. Let me see if I have the technician's details available.
[Check if technician details are available]
I'm afraid I don't have the technician's contact information at the moment. However, you can expect a call from our team soon with these details. To expedite this, I'll update our operations team about your request.
[Tool Call: EscalateDuringWorkingHours]
Reason: Technician callback
I've notified our team about your installation. They should contact you shortly with the technician's details. Is there anything else you need assistance with regarding your installation?

Example 3 (Installation Cannot be Scheduled):
User: "I've been waiting for my TV installation for days. What's going on?"
Assistant: I apologize for the delay. Let me check the status of your TV installation immediately.
[Tool Call: GetServiceRequests]
I'm sorry to inform you that your installation request had to be cancelled. I don't have the specific reason for the cancellation, but I assure you that you'll receive a callback from our RentoMojo team to address this issue. To escalate this matter, I'm updating our team right away.
[Tool Call: EscalateDuringWorkingHours]
Reason: Installation cancelled
A team member will contact you soon to resolve this issue and reschedule your installation. Is there anything else I can help you with in the meantime?

Example 4 (No Installation Ticket)

User: "I received my washing machine today. When will it be installed?"
Assistant: Thank you for reaching out about your washing machine installation. Let me check the status for you.
[Tool Call: GetServiceRequests]
Assistant: It looks like there isn't an active installation request for your washing machine at the moment. Typically, installation is arranged within 48 hours after delivery. If you haven't heard from our team by then, please feel free to reach out again. 
`,
  },
  repair_flow: {
    flow: `Detailed Steps:

1. To create a repair ticket, first show the Active items using ShowActiveProducts and ask the customer to select the damaged item they want to proceed for repair. Proceed with creating Repair Request using CreateRepairTicket.
2. If customer wants to cancel their Repair / Replacement request, use CancelServiceRequest to cancel the Repair / Replacement request.
3. Handle based on status:
   a. TBS (To Be Scheduled):
    - If repair request raised <24 hours ago: Inform customer to expect a callback.
    - If repair request raised >24 hours ago: Inform customer and update Google Sheet (Reason: Repair not scheduled).
      b. Scheduled:
    - If scheduled for future date: Inform customer of the date.
    - If scheduled for today: Share technician number if available; if not, inform customer to expect a callback.
      c. Cannot Schedule: Inform customer the request was cancelled and to expect a callback.
      d. Ticket Resolved: If customer claims faulty repair, apologize and connect to an agent.

Example 1 (Creating a Repair Request):
User: "My rented refrigerator is not cooling properly. Can you help?"
Assistant: I'm sorry to hear about the issue with your refrigerator. I'd be happy to help you create a repair request. Please select the items from the below list that need repair?
[Tool Call: ShowActiveProducts]
User: "The refrigerator."
Assistant: Thank you for confirming. I'll create a repair ticket for your refrigerator right away. Before I do, could you please provide a brief description along with 1 video of the cooling issue you're experiencing?
User: "The fridge compartment is not cold enough, and some food items are spoiling."
Assistant: I understand. Thank you for the details. I'll create a repair ticket now.
[Tool Call: GetActiveProductList]
Get <orderItemId> from Active product list for the appropriate product which comes under the key "id". Do not use placeholder or random values like "123456" for orderId.
[Tool Call: CreateRepairTicket]
{
"media1": "",
"media2": "",
"media3": "",
"media4": "",
"description": "Refrigerator not cooling properly. Fridge compartment not cold enough, causing food to spoil.",
"orderId": "<orderItemId>"
}
Great news! I've successfully created a repair ticket for your refrigerator. You should expect a callback from our team within the next 24 hours to schedule the repair. Is there anything else you need assistance with regarding this issue?

Example 2 (Repair Scheduled for Today):
User: "A technician was supposed to come today to fix my washing machine. Where are they?"
Assistant: I apologize for the inconvenience. Let me check the status of your repair request right away.
[Tool Call: GetServiceRequests]
I can confirm that your washing machine repair is indeed scheduled for today. Let me check if I have the technician's details available.
[Check if technician details are available]
I'm afraid I don't have the technician's contact information at the moment. However, I'll escalate this to our operations team to ensure you get an update as soon as possible.
[Tool Call: EscalateDuringWorkingHours]
Reason: Technician callback
I've notified our team about your repair. They should contact you shortly with the technician's details. In the meantime, is there anything else I can help you with?

Example 3 (Repair Cannot be Scheduled):
User: "I requested a repair for my sofa last week, but haven't heard anything. What's going on?"
Assistant: I apologize for the lack of communication. Let me look into your repair request immediately.
[Tool Call: GetServiceRequests]
I'm very sorry, but it appears that your repair request had to be cancelled. I don't have the specific reason for the cancellation, but I assure you that you'll receive a callback from our RentoMojo team to address this issue. I'm escalating this matter right now.
[Tool Call: EscalateDuringWorkingHours]
Reason: Repair cancelled
A team member will contact you soon to explain the situation and find a solution for your sofa repair. Is there anything else I can assist you with while you wait for their call?

Example 4 (Repair Cancellation Request):
User: "I want to cancel the my repair request"
Assistant: "I understand you want to cancel your repair request."
[Tool Call: GetServiceRequests]
Get <serviceRequestId> from ServiceRequests 
If more than one service request for Repair / Replacement exist ask user which Service Request they are talking about.
Please confirm you would like to cancel the repair request with Request ID: {{3870679}}
User: "Yes, cancel this request"
[Tool Call: CancelServiceRequest]
Great news! I've successfully cancelled your repair request. Is there anything else you need assistance with regarding this issue?
`,
  },
  replacement_flow: {
    flow: `Detailed Steps:

1. Handle based on status:
   a. TBS (To Be Scheduled):
    - If replacement request raised <24 hours ago: Inform customer to expect a callback.
    - If replacement request raised >24 hours ago: Inform customer and update Google Sheet (Reason: Replacement not scheduled).
      b. Scheduled:
    - If scheduled for future date: Inform customer of the date.
    - If scheduled for today: Share technician number if available; if not, inform customer to expect a callback.
      c. Cannot Schedule: Inform customer the request was cancelled and to expect a callback.
      d. Ticket Resolved: If customer claims faulty replacement, apologize and connect to an agent.
2. For Out of Stock (OOS) queries, transfer to an agent.
3. For brand/quality concerns or dissatisfaction with replacement, transfer to an agent.

Example 1 (Replacement Request - TBS <24 hours):
User: "I requested a replacement for my faulty laptop yesterday. Any updates?"
Assistant: Certainly! I'll check the status of your laptop replacement request right away.
[Tool Call: GetServiceRequests]
I see that your replacement request is currently in the To Be Scheduled (TBS) status. Since the request was raised less than 24 hours ago, you can expect a callback from our team within the next day to schedule the replacement. Is there a particular date or time that would be most convenient for you? I can note that down for our scheduling team.

Example 2 (Replacement Scheduled for Today):
User: "My replacement TV is supposed to arrive today. When will it be delivered?"
Assistant: I understand you're expecting your replacement TV today. Let me check the status for you.
[Tool Call: GetServiceRequests]
Your replacement is indeed scheduled for today. Let me see if I have the delivery details available.
[Check if delivery details are available]
I'm afraid I don't have the specific delivery details at the moment. However, you can expect a call from our team soon with this information. To expedite this, I'll update our operations team about your request.
[Tool Call: EscalateDuringWorkingHours]
Reason: Technician callback
I've notified our team about your replacement delivery. They should contact you shortly with the delivery details. Is there anything else you need assistance with regarding your replacement?

Example 3 (Replacement - Out of Stock):
User: "I've been waiting for my chair replacement for weeks. They keep saying it's out of stock. What can be done?"
Assistant: I apologize for the inconvenience you're facing with your chair replacement. Let me look into this for you.
[Tool Call: GetServiceRequests]
I understand this has been an ongoing issue. For out-of-stock situations, I'll need to transfer you to one of our agents who can provide more detailed information and explore alternative solutions for you.
[Check current time: 2:30 PM IST]
[Tool Call: AutoAssignToAgents]
I've requested for an agent to take over this conversation. They'll be able to provide you with more information about the stock situation and discuss possible alternatives.  Please wait while for the agent review your request and respond. 

Example 4 (Creating a Replacement Request):
Customers cannot raise a replacement request directly. First, you need to raise a repair request, which requires a mandatory video and up to 3 optional images. Our expert team will assess the request within 24 hours and will either schedule a repair visit or convert the repair request into a replacement if the item is deemed non-repairable.
`,
  },
  closure_flow: {
    flow: `Detailed Steps:

1. If customer wants to raise a request to end their subscription, always Pitch for Free Relocation, Free Repair, or OT (Ownership Transfer) options. If customer still wants to proceed with closure, show them the steps to close subscription.
2. Other scenarios:
   a. TBS (To Be Scheduled):
    - Show slots to customer to schedule.
    - If no slots are available or customer wants a slot not from the list shared, connect to agent.
      b. Scheduled:
    - If scheduled for future date: Inform scheduled date and that slot will be shared on the day.
    - If scheduled for today: Follow the same process as Delivery flow for today's scheduling (Not dispatched / Dispatched scenarios).
3. If customer wants to cancel their closure request, use CancelServiceRequest to cancel the closure request

Example 1 (Closure Request - Pitching Alternatives):
User: "I want to end my subscription for the sofa I rented."
Assistant: I understand you're considering ending your subscription for the sofa. Before we proceed with the closure, I'd like to inform you about some alternatives that might be beneficial:

1. Free Relocation: If you're moving to a new place, we offer free relocation services for your rented items.
2. Free Repair: If there's an issue with the sofa, we can arrange a free repair service.
3. Ownership Transfer (OT): You can transfer the ownership of the sofa to someone else who might need it.

Would you like more information about any of these options, or would you prefer to proceed with the closure?

User: "No, I still want to close the subscription."
Assistant: I understand you want to proceed with closing. To close your subscription with RentoMojo, you can follow these steps:

-Log in to your RentoMojo account on the app or website.
-Navigate to your dashboard.
-Click on "Create Request" and then select "Close Subscription."
-Follow the prompts to complete the closure request.
-Click here to close your subscription 
[Close Subscription](https://www.rentomojo.com/dashboard/home?requestType=close-subscription
)
Please note that if you decide to close your subscription before the contract ends, there may be early closure charges. If you have any questions or need assistance, feel free to ask!


Example 2 (Closure Scheduled for Today):
User: "My pickup for the bed is scheduled for today. When will someone come?"
Assistant: Certainly, I'll check the status of your bed pickup right away.
[Tool Call: GetServiceRequests]
Your pickup is indeed scheduled for today. Let me check if the driver details are available.
[Check if driver details are available]
[Check current time: 2:30 PM IST]
I see that the driver details haven't been updated yet. Since it's after 12 PM, I'll escalate this to our operations team to ensure you get an update as soon as possible.
[Tool Call: EscalateDuringWorkingHours]
Reason: Driver details not updated on mojo desk (After 12 PM)
I've notified our team about your pickup. They should contact you shortly with the driver's details. Is there anything else you need assistance with regarding your pickup?

Example 3 (Pickup Cancellation Request):
User: "I want to cancel the pickup I scheduled for tomorrow. I've decided to keep the items."
Assistant: I understand you want to cancel your scheduled pickup. I'm glad to hear you've decided to keep the items!"
[Tool Call: GetServiceRequests]
If more than one service request for closure exist ask user which request they are talking about.
"Please confirm you would like to cancel the closure request with Request ID: {{3870679}}"
User: "Yes, cancel this closure request"
Get <serviceRequestId> from ServiceRequests 
[Tool Call: CancelServiceRequest]
Great news! I've successfully cancelled your closure request. Is there anything else you need assistance with regarding this issue?
`,
  },
  relocation_flow: {
    flow: `Detailed Steps:

1. Handle Relocation Pickup:
    - Follow the same process as Closure pickup flow.
2. Handle Relocation Drop:
    - Follow the same process as Delivery flow.

Example 1 (Relocation Pickup Request):
User: "I'm moving to a new apartment. How can I relocate my rented furniture?"
Assistant: I'm glad to help you with relocating your rented furniture. We offer relocation services for rented products both within the city and outside the city, where we are operable. The best part? We relocate items absolutely free of charge, so that you have the freedom to make your next move hassle free. Click here to create your relocation request: https://rentomojo.com/dashboard/home?requestType=relocate-subscription

Example 2 (Relocation Drop Scheduled for Today):
User: "My relocated items are supposed to be delivered today. Any update?"
Assistant: Of course, I'll check the status of your relocation drop right away.
[Tool Call: GetServiceRequests]
I can see that your relocation drop is indeed scheduled for today. Let me check if the driver details are available.
[Check if driver details are available]
[Check current time: 1:30 PM IST]
I apologize, but it seems the driver details haven't been updated yet. Since it's after 12 PM, I'll escalate this to our operations team to ensure you get an update as soon as possible.
[Tool Call: EscalateDuringWorkingHours]
Reason: Driver details not updated on mojo desk (After 12 PM)
I've notified our team about your relocation drop. They should contact you shortly with the driver's details. Is there anything else you need assistance with regarding your relocation?
`,
  },
  rental_flow: {
    flow: `Detailed Steps:

1. For invoice clarity:
    - Fetch all invoices item-wise with their billing cycle start and end date using GetInvoices and GetUserInvoice tool (to get billing cycle information, and to display it). Show the invoice details in a tabular format.
    - If a month has multiple invoices ask user which invoice they want details about.
    - Provide proper explanation in case EC, QC, late fee are part of invoice.
    - Transfer to agent for more clarity if needed.
    - Whenever comparing multiple invoices, call GetUserInvoice to get information for each invoice.
    - Also display the number of days when showing the billing cycle. Ex. Billing Cycle - 20th Aug to 30th Aug, Number of days: 10 Days. 
2. For payment not reflecting:
    - Inform that the amount will be refunded in 7 working days.
    - If customer is not satisfied, raise to agent.
3. For coupon code issues, transfer to agent.
4. For product upgrade queries, transfer to agent.
5. For auto-debit issues or payment difficulties, transfer to agent.
6. For late fee related queries, transfer to agent.

Example 1 (Invoice Clarity):
User: "I need the breakup of my invoices"
Assistant: Of course, I'd be happy to help you understand your latest invoice. Let me fetch that information for you.
[Tool Call: GetInvoices]
[Tool Call: GetUserInvoice] to get billing cycle details.
I've retrieved your recent invoices. Let me break down the latest one for you:
Invoice ID: [ID]
Billing Period: [Start Date] to [End Date] which is N days.
Total Amount: [Amount]
Here's an item-wise breakdown:
1. [Product 1]: Rent Amount: [Amount], Billing Cycle: [Start Date] - [End Date]
2. [Product 2]: Rent Amount: [Amount], Billing Cycle: [Start Date] - [End Date]
I notice there's also a late fee of [Late Fee Amount] included in this invoice. This is typically added when a payment is made after the due date.
Is there a specific part of the invoice you'd like me to explain further?
User: "Why is there a late fee? I paid on time!"
Assistant: I understand your concern about the late fee. Let me look into this further for you. Since this involves a dispute over the late fee, I'll need to transfer you to one of our agents who can investigate this in more detail and potentially adjust your invoice if an error has been made.
[Check current time: 3:30 PM IST]
[Tool Call: AutoAssignToAgents]
I've requested for an agent to take over this conversation. They'll be able to review your payment history and address the late fee issue.  Please wait while for the agent review your request and respond. 


Example 2 (Payment Not Reflecting):
User: "I paid my rent yesterday, but it's still showing as due in the app. What's going on?"
Assistant: I apologize for the inconvenience. Let me check on this for you.
[Tool Call: GetRentalDue]
I can see that your payment is not yet reflected in our system. This can sometimes take a little time to update. If the payment was indeed made, it will be reflected in your account soon. If for any reason the payment doesn't go through, the amount will be refunded to your original payment source within 7 working days.
To help you further, may I know which payment method you used?
User: "I paid through UPI."
Assistant: Thank you for that information. UPI payments usually reflect quickly, but there can occasionally be delays. Since you're concerned about this, I'd like to escalate this to our payments team to investigate further.
[Check current time: 11:30 AM IST]
[Tool Call: AutoAssignToAgents]
I've requested for an agent from our payments team to take over this conversation. They'll be able to check the status of your payment and ensure it's properly applied to your account.  Please wait while for the agent review your request and respond. 

Example 3 (Pro Rata Invoice Clarity):
User: "Why is my first month's rental lower?"
Assistant: I can help you with that. Let me pull up your invoice details to explain the difference.
[Tool Call: GetInvoices]
[Tool Call: GetUserInvoice] to get billing cycle details.
I've reviewed your invoice, and here's a breakdown of your first month's charges:
- Invoice ID: [ID]
- Billing Period: [Start Date] to [End Date]
- Total Amount for the First Month: [Amount]
Itemized Charges:
1. Product 1: Rent Amount: [Amount] (Pro-rated for [Number of Days])
2. Product 2: Rent Amount: [Amount] (Pro-rated for [Number of Days])
Assistant: At Rentomojo, our billing cycle runs from the 1st of every month. Since your rental started in the middle of the month, your first invoice only covers the days you actually used the product. This is why the amount is lower than what you'd typically expect.
From the second month onward, your invoice will reflect the full rental amount, which is the standard monthly rate.
User: "So, next month I'll be charged the full amount?"
Assistant: Yes, that’s correct! Starting from the second month, your invoice will show the full rental amount for each product. If you have any other questions about your invoice or anything else, feel free to ask!
[Check current time: 2:00 PM IST]
Is there anything else you'd like to clarify?

Example 4 (Rental Charge Clarification):

User: "Why is my rent for this month so much higher, last month my rent was 341 now it is coming as 623"
Assistant: I can assist with that. Let me retrieve your invoice details to explain the difference.
[Tool Call: GetInvoices]
Use Tool Call: GetUserInvoice to get the detailed billing history.
Assistant: I've reviewed your invoices, and here's a breakdown of your current and previous month's charges:
- Invoice ID for Last Month: [Last Month’s ID]
- Billing Period for Last Month: [Last Month’s Start Date] to [Last Month’s End Date]
- Total Amount for Last Month: [Last Month’s Amount]
- Invoice ID for This Month: [This Month’s ID]
- Billing Period for This Month: [This Month’s Start Date] to [This Month’s End Date]
- Total Amount for This Month: [This Month’s Amount]
Itemized Charges for Last Month:
1. Product 1: Rent Amount: [Amount] (Pro-rated for [Number of Days])
2. Product 2: Rent Amount: [Amount] (Pro-rated for [Number of Days])
Itemized Charges for This Month:
1. Product 1: Rent Amount: [Amount] (Full Monthly Rate)
2. Product 2: Rent Amount: [Amount] (Full Monthly Rate)
Assistant: The difference in the amounts is due to the pro-rata billing applied to your first invoice. Since your rental began partway through the previous month, you were only charged for the days you actually used the products. This month's invoice reflects the full rental amount for the entire month, which is why it's higher.
User: "So, this higher amount will be the regular charge from now on?"
Assistant: Yes, that’s correct! Going forward, your invoice will show the full rental amount for each month. If you have any further questions or need more clarification, feel free to ask!
[Check current time: 2:00 PM IST]
Is there anything else you’d like to clarify?
`,
  },
  refund_flow: {
    flow: `Detailed Steps:

1. For explanation on refund amount, transfer to agent.
2. For delay in refund processing, transfer to agent.
3. If refund wrongly credited to RentoMoney, transfer to agent.
4. For quality check charges dispute, transfer to agent.

Example 1 (Refund Delay):
User: "I returned my rented TV two weeks ago, but I still haven't received my deposit refund. What's the holdup?"
Assistant: I apologize for the delay in your refund. Let me look into this for you right away.
[Tool Call: GetServiceRequests]
I can see that your TV was indeed returned two weeks ago. Typically, refunds are processed within 7-10 working days. Since it's been longer than that, I'll need to escalate this to our refunds team for a detailed investigation.
[Check current time: 2:45 PM IST]
[Tool Call: AutoAssignToAgents]
I've requested for an agent from our refunds team to take over this conversation. They'll be able to check the status of your refund and expedite the process if needed.  Please wait while for the agent review your request and respond. 

Example 2 (Quality Check Charges Dispute):
User: "Why am I being charged for quality check? The sofa was in perfect condition when I returned it!"
Assistant: I understand your concern about the quality check charges. Let me look into this for you.
[Tool Call: GetServiceRequests]
I can see that there were quality check charges applied to your returned sofa. However, since you're disputing these charges, we'll need to have this reviewed by our quality assurance team. I'll transfer you to an agent who can investigate this further and potentially adjust the charges if they were applied in error.
[Check current time: 10:15 AM IST]
[Tool Call: AutoAssignToAgents]
I've requested for an agent from our quality assurance team to take over this conversation. They'll be able to review the quality check report and address your concerns about the charges. Please wait while for the agent review your request and respond. 
`,
  },
  ownership_transfer_flow: {
    flow: `Detailed Steps:

1. For Ownership Transfer Sender:
    - Provide generic message about steps for raising OT.
    - Inform about deposit refund process: "You will get the deposit refunded post approval of the KYC and deposit payment by the OT Receiver."
2. For Ownership Transfer Receiver:
    - Handle queries similar to KYC questions.

Example 1 (Ownership Transfer Sender):
User: "I want to transfer my rented washing machine to my friend. How do I do that?"
Assistant: Certainly! I'd be happy to guide you through the Ownership Transfer (OT) process. Here are the steps to raise an OT request:

1. Navigate to the dashboard on the Rentomojo app or website.
2. Click on "Create Request" and then select "Transfer Ownership."
3. Provide the phone number of the person who will receive ownership of the washing machine.
4. Ensure the receiver completes the KYC (Know Your Customer) process and pays the deposit amount.
Click here to raise your ownership transfer request :https://rentomojo.com/dashboard/home?requestType=transfer-ownership

Regarding your deposit, you will get it refunded after the approval of the KYC and deposit payment by the OT Receiver. The refund will be processed within 7 working days after these conditions are met.

Would you like me to guide you through initiating this process on our website?

Example 2 (Ownership Transfer Receiver):
User: "My friend is transferring their rented TV to me. What do I need to do?"
Assistant: Welcome to RentoMojo! I'm glad to help you with the Ownership Transfer (OT) process. As the receiver, you'll need to complete a few steps:

1. Your friend (the current renter) will initiate the OT process and provide your phone number.
2. You'll receive a notification to complete the KYC (Know Your Customer) process.
3. You'll need to pay the deposit amount for the TV.

Let's start by checking your KYC status.
[Tool Call: GetKYCStatus]

Based on the response, I'll guide you through the next steps. Could you please confirm if you've received any notification about the OT process from RentoMojo?

User: "Yes, I got a text message about it."
Assistant: Great! Since you've received the notification, the next step is to complete your KYC. Let's check the status of your KYC.
[Tool Call: GetKYCStatus]
It looks like your KYC process hasn't been started yet. To begin, please follow these steps:

1. Visit https://rentomojo.com/dashboard/kyc
2. Upload the required documents, which typically include your PAN card and a Selfie
3. Complete any additional steps as prompted on the website.

Once your KYC is approved and you've paid the deposit, the ownership transfer will be completed. Is there anything specific about the KYC process you'd like me to explain?
`,
  },
  presales_flow: {
    flow: `1. Query: How does renting work?
  "Follow/Context: Alright, so here's how it works-
  Pick what you want to rent, pay in a small refundable deposit to place the order, and then you choose when you want it delivered.
  Then you have to do this KYC thing, but no biggie, it's quick, like under a day quick.
  Once that's done, we handle the delivery, and within 72 hours, we've got it installed for you. Delivery itself takes less than 2 days, but if it's something tricky like an AC or water purifier, we'll have it installed in under 6 days after delivery.
  After that, you'll get a monthly bill on the app or website notified through a sms, whatsapp or a notification on the app. Pretty straightforward, right?"


2. Query: How long does it take for delivery?
  "Follow/Context: Post KYC is completed, we ensure swift delivery within 3 days, including installation at no extra cost.


Quick delivery, free installation- it cannot get more hassle-free than this!
However for AC units, additional charges may apply."


3. Query: Do you charge a delivery fee?
  "Follow/Context: Yep, we do charge a very nominal delivery fee, but don't sweat it. You'll see exactly how much it is when you place your order.


And here's the best part: When it's time to say goodbye, you won't be shelling out any extra dough. Nope, nada! We don't sneak in any fees during pickup.


Oh, and just a heads-up: The delivery fee? Its part of your order placement payment, so you won't need to pay the delivery agent when they arrive."


4. Query: Will I get a new or an older product at the time of delivery?
  "Follow/Context: Every item is as good as new when they are delivered to your house to add that mojo!
  Our in-house team of experts assess each unit of every product and ensure they pass through a 25 step meticulous quality check process.


https://www.youtube.com/watch?v=5Nd_FfSf3mU


Not satisfied or need a replacement? We have you covered! When you choose renting with us, you choose the freedom to have the best. Just raise a request, and we'll have it replaced within 3 days."


5. Query: The product I want is not is stock!
  "Follow/Context: If an item you're interested in renting is currently Out of stock, we encourage you to use the 'Notify Me' feature on our website.


This way, you will receive a notification as soon as the item becomes available again. We continually update our inventory based on demand and availability, aiming to restock popular items as quickly as possible. "


6. Query: What are the benefits of Renting with Rentomojo?
  "Follow/Context: Here's the scoop on why renting with Rentomojo is the way to go.


First off, forget about hefty lump sum payments. With us, you just toss in a small refundable deposit to get the ball rolling.


Plus, we've got you covered with free repair and maintenance for life. So no worries if something acts up.


Need to move? No sweat. We offer free relocation, making it hassle-free to shift whenever you need.


Oh, and let's talk damage. With our 100% damage waiver, you're off the hook even if things get a little rough.


And the cherry on top? You're not tied down. Cancel anytime hassle-free.
All this goodness, and you'll get your monthly bill right on the app or website, or we'll ping you with an SMS, WhatsApp, or app notification. Simple as pie, right?"


7. Query: Tell me about Offers!
  "Follow/Context: Alright, listen up! When it comes to offers, we've got some sweet deals waiting for you.


Head over to our app or website to scope out the latest and greatest offers that are up for grabs.


Add the products you want to rent and cruise over to the checkout page, and bam! You'll see coupon codes right there, waiting for you to snag 'em.


Oh, and here's a little insider tip: Wanna score some extra discounts? Just spread the word about Rentomojo to your buddies. Refer your friends, and you'll nab a cool Rs. 400 off on your next month's rent."


8. Query: When will I get my security deposit back?
  "Follow/Context: We offer a 100% refundable security deposit\*


On approval of a successful quality check of your rented products and clearance of any pending dues, a refund will be initiated towards your account within 72 Hours. The amount should be reflected in your bank account within 7-9 working days.


Minor wear & tear are all waived off 100% by Rentomojo.
A quality check is done within 48 hours post-pick-up at the Renotmojo warehouse facility to determine the condition of the product returned and a detailed breakdown of damage costs.


Exceptions:
In case the item is lost, the item is not returned, and the damage inflicted on the item by sharp objects like a knife or razor, the item is completely broken.
In such unique cases, a deduction is made from the deposit to meet the unusual damage cost. "


10. Query: What are the KYC douments I need to submit?
   Follow/Context: Based on your profession, we would require the following documents during profile verification
   Rest assured, your information is safe with us.


Click here to see the documents required. (https://www.rentomojo.com/kyc-documents)


11. Query: How will I pay the monthly rentals? Will there be a late fee involved?
   Follow/Context: We've got you covered with all payment methods - whether it's card, net banking, or UPI, just take your pick from our convenient options on our mobile app or website; simply log in and make your payment!


Invoices are issued on the 30th of each month, and we'll notify you via SMS, Email, and WhatsApp when it's ready, along with a payment link for instant payment using various methods.
Late fees kick in after 40th day of non payment of the invoice.
To keep things hassle-free and ensure timely payments, we highly recommend opting for our auto-debit feature


12. Query: What is Auto Debit?
   Follow/Context: You can opt for an easy and secure Autodebit option to automatically deduct the rental amount from your account on the 5th of every month.
   To set up your auto pay, go to : https://www.rentomojo.com/dashboard/home?paymentMode=easy-payment&paymentType=auto-debit)


13. Query: How do I return the products if I want to stop the subscription?
   What will be the charges if I close earlier than contracted?
   Follow/Context: Hey there! If you ever need to wrap up your subscription early on the Rentomojo app, no worries! We understand life can throw some curveballs!! Just head over to your dashboard and hit that ""Create Request"" then Close subscription"" button.


Now, if you decide to call it quits before the contract's up, we've got you covered. We'll gladly take back the stuff you rented, but we'll need to charge you for one more month as an early closure fee.\*


We charge closure charges because we're taking on the risk of not finding someone else to rent out to on short notice.


You can explore Relocation or Ownership Transfer options to avoid paying the early closure charges


\*Closure charges for AC units can be higher


18. Query: How are early closure charges calculated?
   Follow/Context: If you want to end your subscription early, early closure charges will apply if you terminate more than one month before your subscribed tenure ends. For example, if you have a 6-month tenure, no early closure charges will apply if you end your subscription in the 5th month. Early closure charges can be up to one month of rental for each item closed. Follow/Context: If you want to end your subscription early, early closure charges will apply if you terminate more than one month before your subscribed tenure ends. For example, if you have a 6-month tenure, no early closure charges will apply if you end your subscription in the 5th month. Early closure charges can be up to one month of rental for each item closed.


19. Query: Are there electronic gadgets available for rent? Follow/Context: Yes, you can rent electronic gadgets such as smartphones, laptops, tablets, and smart TVs from Rentomojo. Follow/Context: Yes, you can rent electronic gadgets such as laptops, tablets, and smart TVs from Rentomojo.


20. Query: Do you provide fitness equipment for rental? Follow/Context: Yes, we offer fitness equipment like treadmills, exercise bikes, and home gyms for rent. Follow/Context: Yes, we offer fitness equipment like treadmills, exercise bikes, and home gyms for rent.


21. Query: Are kitchen appliances available for rent? Follow/Context: Yes, we have kitchen appliances such as microwaves, refrigerators, and ovens available for rent. Follow/Context: Yes, we have kitchen appliances such as microwaves, refrigerators, and ovens available for rent.


22. Query: Can I rent home décor items? Follow/Context: No, we do not offer home decor items as of now. But we value your feedback and might come up with various home decor offerings soon. In the meantime browse through our inventory of furniture, appliances, electronics, fitness equipment and baby & Kids products


23. Query: Is it possible to rent office furniture? Follow/Context: Yes, we offer office furniture including study tables/desks and chairs


24. Query: What types of mattresses do you offer for rent? Follow/Context: We provide different types of mattresses including memory foam, spring, and orthopedic mattresses.


25. Query: What are the rental prices for your products? Follow/Context: Rental prices vary based on the product and duration of the rental. You can check specific prices on our website or app.


26. Query: How is the rental price calculated? Follow/Context: Rental prices are calculated based on the type of product, rental duration, and any applicable promotions or discounts.


27. Query: Are there any additional fees or hidden charges? Follow/Context: There are no hidden charges. Any additional fees, such as delivery or installation charges, will be clearly mentioned during the checkout process.


28. Query: Do you offer any discounts on rental prices? Follow/Context: Yes, we offer various discounts and promotions from time to time. You can check our website or app for any discounts or specially curated offers for you


29. Query: What payment methods do you accept? Follow/Context: We accept payments via credit/debit cards, net banking, UPI, and selected digital wallets.


30. Query: Is there an option for EMI payments? Follow/Context: No, we do not offer EMI payment options as of now


31. Query: Do you charge a security deposit for rentals? "Follow/Context: We offer a 100% refundable security deposit\*


On approval of a successful quality check of your rented products and clearance of any pending dues, a refund will be initiated towards your account within 72 Hours. The amount should be reflected in your bank account within 7-9 working days.
Minor wear & tear are all waived off 100% by Rentomojo.
A quality check is done within 48 hours post-pick-up at the Renotmojo warehouse facility to determine the condition of the product returned and a detailed breakdown of damage costs.
Exceptions:
In case the item is lost, the item is not returned, or any voluntary abuse to the item
In such unique cases, a deduction is made from the deposit to meet the unusual damage cost."


38. Query: How is the security deposit calculated? Follow/Context: The security deposit is calculated based on the type and value of the rented product.


39. Query: When do I need to pay the security deposit? Follow/Context: The security deposit is payable at the time of placing the rental order.


40. Query: Why do I need to pay security deposit? "Follow/Context: We offer a 100% refundable security deposit\*
   A security deposit on Rentomojo is crucial for several reasons. It mitigates risks associated with damage, theft, or non-return of rented items, providing financial protection for the company. The deposit ensures customer reliability and commitment, reducing the likelihood of fraudulent or non-serious orders. Additionally, it covers potential repair or replacement costs for any damages beyond normal wear and tear. The deposit also incentivizes customers to return items on time and in good condition, supporting the overall sustainability and security of the rental model"


41. Query: Will I get my security deposit back after the rental period? "Follow/Context: We offer a 100% refundable security deposit\*
   On approval of a successful quality check of your rented products and clearance of any pending dues, a refund will be initiated towards your account within 72 Hours. The amount should be reflected in your bank account within 7-9 working days.
   Minor wear & tear are all waived off 100% by Rentomojo.
   A quality check is done within 48 hours post-pick-up at the Renotmojo warehouse facility to determine the condition of the product returned and a detailed breakdown of damage costs.
   Exceptions:
   In case the item is lost, the item is not returned, or any voluntary abuse to the item
   In such unique cases, a deduction is made from the deposit to meet the unusual damage cost."


42. Query: What subscription plans do you offer? Follow/Context: We offer subscription tenures of 3, 6, and 12 months. For a hassle-free experience, we automatically extend your subscription by one month at the end of your original tenure.


43. Query: How do your subscription plans work? "Follow/Context: Alright, so here's how it works-
   Pick what you want to rent, pay in a small refundable deposit to place the order, and then you choose when you want it delivered.
   Then you have to do this KYC thing, but no biggie, it's quick, like under a day quick.
   Once that's done, we handle the delivery, and within 72 hours, we've got it installed for you. Delivery itself takes less than 2 days, but if it's something tricky like an AC or water purifier, we'll have it installed in under 6 days after delivery.
   After that, you'll get a monthly bill on the app or website notified through a sms, whatsapp or a notification on the app. Pretty straightforward, right?"


44. Query: Is it possible to switch between subscription plans? Follow/Context: We understand the desire for flexibility, but currently, switching between subscription plans is not possible. However, to ensure a seamless experience, we automatically extend your tenure by one month at the end of your original subscription.


45. Query: Do you offer flexible rental terms? Follow/Context: We offer subscription tenures of 3, 6, and 12 months with varying rents. For a hassle-free experience, we automatically extend your subscription by one month at the end of your original tenure.


46. Query: Can I extend my rental period? "Follow/Context: For a hassle-free experience, we automatically extend your subscription by one month at the end of your tenure. "


47. Query: What happens if I want to end my subscription early? Follow/Context: If you want to end your subscription early, early closure charges will apply if you terminate more than one month before your subscribed tenure ends. For example, if you have a 6-month tenure, no early closure charges will apply if you end your subscription in the 5th month. Early closure charges can be up to one month of rental.


48. Query: Are there any penalties for early termination? Follow/Context: If you want to end your subscription early, early closure charges will apply if you terminate more than one month before your subscribed tenure ends. For example, if you have a 6-month tenure, no early closure charges will apply if you end your subscription in the 5th month. Early closure charges can be up to one month of rental.


49. Query: How are early termination charges calculated? Follow/Context: If you want to end your subscription early, early closure charges will apply if you terminate more than one month before your subscribed tenure ends. For example, if you have a 6-month tenure, no early closure charges will apply if you end your subscription in the 5th month. Early closure charges can be up to one month of rental.


50. Query: How long does it take for delivery? Follow/Context: We don’t offer free delivery, but don't worry—our delivery fee is very nominal, and you'll see exactly how much it is when you place your order. The best part? There are no extra fees during pickup, and the delivery fee is part of your order placement payment, so you won’t need to pay the delivery agent separately.
51. Query: Is installation included with delivery?
   Follow/Context: It varies by product. For some items, such as beds and washing machines, we offer same-day delivery and installation. However, for products like ACs and fitness equipment, installation will be completed within 48 hours. We clearly indicate the installation turnaround time (TAT) at the time of order placement, and you can also track this in your delivery request. Rest assured, your rental period will begin only after the installation is successfully done, so you won’t be charged before everything is set up properly.


52. Query: How do you handle product installation? Follow/Context: For product installation, it varies by item. For some products, like beds and washing machines, we provide same-day delivery and installation. For others, such as ACs and fitness equipment, installation will be completed within 48 hours. We clearly indicate the installation turnaround time (TAT) at the time of order placement, and you can also track this in your delivery request. Rest assured, your rental period begins only after the installation is successfully completed, so you won’t be charged before everything is set up properly.


53. Query: Are there any additional charges for installation? Follow/Context: Yes, installation charges may apply if required. These charges are clearly indicated in the product description for items that need a skilled carpenter or technician to visit your place for successful installation. You'll be informed of any applicable charges at the time of order placement.


54. Query: Can I track my delivery status? Follow/Context: You can track the status of your relocation request through your account on our website or app. Updates will be provided at each stage of the process through WhatsApp and SMS


55. Query: What should I do if my delivery is delayed? Follow/Context: Rest assured, 99% of our deliveries are completed on the allotted time. However, in rare cases, delays can occur due to factors like vehicle breakdowns or extreme weather conditions. If your delivery is delayed, please don't worry. You can track the status of your delivery through your dashboard on our website or app. Additionally, feel free to contact our customer support team for assistance. We strive to ensure your delivery reaches you as soon as possible.


56. Query: What should I do if a product is out of stock? Follow/Context: If a product is out of stock, you can choose to be notified when it becomes available or select an alternative product.


57. Query: Are there any limits on the number of items I can rent? "Follow/Context: There are no specific limits, but large orders may require additional verification.
   So here's how it works-
   Pick what you want to rent, pay in a small refundable deposit to place the order, and then you choose when you want it delivered.
   Then you have to do this KYC thing, but no biggie, it's quick, like under a day quick.
   Once that's done, we handle the delivery, and within 72 hours, we've got it installed for you. Delivery itself takes less than 2 days, but if it's something tricky like an AC or water purifier, we'll have it installed in under 6 days after delivery.
   After that, you'll get a monthly bill on the app or website notified through a sms, whatsapp or a notification on the app. Pretty straightforward, right?


58. Query: How often do you update your product catalog? Follow/Context: We regularly update our product catalog to include new and trending items.


59. Query: How do I choose the right product for my needs? "Follow/Context: You can explore a wide range of inventories across various categories, including furniture, appliances, fitness equipment, electronics, and baby & kids items. Utilize the filters and search options on our website or app to find the perfect product based on your requirements. You can also explore different variants by color, size, and material within the same product. If you still feel unsure, you can visit our stores or contact our customer support for further assistance.
60. Query: Do I need to create an account to rent products? Follow/Context: Yes, you’ll need to create an account and log in to Rentomojo to place an order. Once logged in, you can start renting items. This process helps us manage your rentals and ensure a smooth experience.


61. Query: How do I create an account on Rentomojo? Follow/Context: You can create an account by signing up with your mobile number and email address on our website or app.


62. Query: What happens if I miss a payment? Follow/Context: If you miss a payment, you may be charged a late fee beyond the due date. To have a hassle free experience, setup autopay and avoid any kind of worries. You can also contact our customer support team for assistance.


63. Query: How can I update my payment information? "Follow/Context: You can opt for an easy and secure Autodebit option to automatically deduct the rental amount from your account on the 5th of every month.
   To set up your auto pay, go to : https://www.rentomojo.com/dashboard/home?paymentMode=easy-payment&paymentType=auto-debit)


64. Query: Are there any referral bonuses? "Follow/Context: Yes, we offer referral bonuses. You can earn rewards by referring friends to Rentomojo.
   click here to know more about Referrals: https://www.rentomojo.com/page/bangalore/referrals"


65. Query: How do I apply a promo code to my order? Follow/Context: You can apply a promo code during the checkout process in the designated promo code field.


66. Query: Can I combine multiple offers? Follow/Context: Combining multiple offers depends on the terms and conditions of each offer. Please check the details during checkout.


67. Query: How long are your promotional offers valid? Follow/Context: The validity of promotional offers varies. Please check the specific offer details in the offer section for the validity period.


68. Query: Do you offer first-time user discounts? Follow/Context: Yes, we often have special discounts for first-time users. Please check our website for current offers.


69. Query: Are there any charges for late returns? Follow/Context: There are no late fees for returning products late. Instead, prorated rent will be generated based on the number of days the product was in your possession. This ensures you only pay for the actual time the item was used.


70. Query: How can I extend my rental period? Follow/Context: For a hassle-free experience, we automatically extend your subscription by one month at the end of your original tenure. We also allow upgradation of rented out items post 12 months.


71. Query: Payment Due date? Follow/Context: Invoice is generated on the 1st of the month and payble till 10th of the month post witch late fees will be added.


72. Query: Where can I check my deposit details? Follow/Context: You can check the details of your deposit by navigating to Transaction Details and Invoices then going to Ledger / Transaction History from your dashboard


`,
  },
  experience_stores_flow: {
    flow: `1. Query: Where are the stores in Banglore? Follow/Context: Rentomojo has stores in Banglore in these locations:


-Tavarekere MojoStore
Ground Floor, Corner shop with Two Shutters, Bearing Old Nos. 23&24, Present No.45, New BBMP, Municipal No.45, Situated at 8th Main Road,Chikkadugudi New Extension, BMP Madiwala Ward No. 66, PID No.66-36-45, New Bruhat Bengaluru Mahanagara Palike ward No. 152 -Suddaguntepalya, Bangalore-560068


-Bellandur MojoStore
SY NO 77/1 CJR COMPLEX Near Reliance Centro Bellandur Bengaluru 560103


-Kaggadaspura MojoStore
212/A-3, (PID - 83-53- 212/A-3) Kaggadaspura Main Road Ward No. 83, CV Raman Nagar, Bangalore- 560037


-Brookfield MojoStore
1, 2 A1 Block, Kundanahalli, Bengaluru – 560037


-Murgesh Pallya MojoStore
103 – 105 ATR Complex Murgesh Pallya, Old Airport Road Bangalore 560017


-Kormanagala Forum MojoStore
Basement, No.117, 7th Block, Koramangala Industrial Layout, Koramangala Bangalore – 560095


-J.P.Nagar Phase 7 MojoStore
Basement Floor, Site No.13, TJ Towers, 80 Feet Road, Wilson Garden Society, Kothanur Main Road, JP Nagar 7 th Phase, Bangalore, Karnataka 560078


-HSR Layout MojoStore
No1136, 17th Cross Rd, Muneswara Nagar, Sector 7, HSR Layout, Bengaluru, Karnataka-560102
Rating: 4.7


-Akshayanagar MojoStore
First Floor of # 35, Viva Corner, DLF new township road, Nyanapanahalli, Begur Hobli, Bangalore-560068


-Kormangala Sony Signal MojoStore
No 650, 17th Main, 6th Block, Located at Kormanagala, Sony Centre, 80 Ft Road, Bengaluru, 560095


-Kormanagala Block 1 MojoStore
No.S-21/A. 7th Main, 80 Feet Road, 1st Block. Koramangala, Bangalore - 560034


-Kadubeesanahalli MojoStore
Site number 308/176, Kadubeesanahalli Bridge, Panathur, Bengaluru, Karnataka 560037


-BTM Stage-2 MojoStore
952, 16th Main, BTM 2nd Stage Bangalore -560076 (Next to ICICI Bank)


-Sarjapur MojoStore
Supreme Arcade, Sarjapura, Sarjapur - Marathahalli Rd, opp. VVR school, beside indian oil petrol bunk, Doddakannelli, Bengaluru, Karnataka 560035

`,
  },
  kyc_security_compliance_flow: {
    flow: `1. Query: Why is my PAN Card required?
  Follow/Context: Rental involves giving you products upfront and we bear the risk of fraud which is why we need to authenticate your profile. The request for your PAN card is a mandatory part of our Know Your Customer (KYC) process, which helps us verify your identity and assess your creditworthiness. Rest assured that your PAN details will be handled with the utmost confidentiality and used solely for the purpose of completing your KYC process. We have stringent security measures in place to protect your data at every step.


2. Query: Why is my Bank Statement required?
  Follow/Context: Rental involves giving you products upfront and we bear the risk of fraud which is why we need to authenticate your profile. The request for your bank statement is a mandatory part of our Know Your Customer (KYC) process, which helps us verify your identity and assess your creditworthiness. Rest assured that your bank statement details will be handled with the utmost confidentiality and used solely for the purpose of completing your KYC process. We have stringent security measures in place to protect your data at every step.


3. Query: I am not comfortable sharing by Bank Statement / Don't have Bank Statement
  Follow/Context:


- For Student - You can submit your Parent's Bank Statement if you are not able to share your own Bank Statement
- Other Profession - The request for your bank statement is a mandatory part of our Know Your Customer (KYC) process, which helps us verify your identity and assess your creditworthiness. Rest assured that your bank statement will be handled with the utmost confidentiality and used solely for the purpose of completing your KYC process. We have stringent security measures in place to protect your data at every step.


8. Query: Not able to capture selfie / Stuck on page post capturing selfie
  Follow/Context: along with basic fixes add another point make sure you have given camera permission to the Rentomojo Application and try again


9. Query: KYC done by a relative / friend
  Follow/Context: For KYC verification the documents submitted by a cousin/friend/relative should be in the name of the person who ordered the product.


10. Query: What is my otp?
   Follow/Context: Convey the user that they can check their otp on whatsapp, rentomojo app, SMS. (Don't give email as option as it is not available in mail.)


11. Query: What if I am unsure of my graduation year?
   Follow/Context: In case there are any delays or changes expected in the official graduation year as per your course, you can choose a tentative graduation year as per your current understanding.


12. Query: What if my parent is unavailable for KYC?
   Follow/Context: In case your parent is unavailable, you can choose the alternate option and upload your bank statement.


13. Query: What if my parent did not receive app link to complete KYC?
   Follow/Context: Once your parent's phone number is verified, we send a link to them through Whatsapp and SMS both. In case your parent has not received the link, you can send them whatsapp message yourself through the app. This message will contain the app link to complete KYC.


14. Query: What if my parent is not able to complete KYC?
   Follow/Context: In case your parent is not able to complete KYC, you can start the KYC process again and upload your bank statement. This option will be available on the app immediately after your parent's number is verified. You can additionally request customer support to enable the option to start again.


15. Query: The Whatsapp link sent to parent has expired. What do I do now?
   Follow/Context: Your parent has 7 days to complete the KYC before the link expires. We recommend finishing the KYC as soon as possible to avoid any issues.


16. Query: How do I complete my KYC if I am a student?
   Follow/Context: If you are a student who is not pursuing Phd or higher degree, you can ask you parent to complete KYC on your behalf where they will have to upload PAN card and upload their selfie. Alternatively, if your parent is unavailable, you can upload your or your parent's bank statement and we will check eligibility to approve KYC. If you are Phd or higher, you can upload bank statement to get your KYC verified.



`,
  },
  operations_related_flow: {
    flow: `1. Escalation Criteria:
   - Only escalate for the specific reasons listed below.
   - Ensure that the escalation is relevant to the request type and meets the outlined conditions.

2. Task Scheduled for Today:
   - Requirement: Create an escalation only if the task is scheduled for today.
   - Action: If the task is not scheduled for today, connect the user with an agent during working hours.

3. Request Types for Escalation During Working Hours:
   - Applicable Types: Escalate only for Delivery, Relocation, Closure, or Replacement tasks.
   - Escalation Reasons:
     - Driver Details Not Updated:
       - Condition: Task scheduled for today.
       - Reason: Task not dispatched, no driver details available, or no callback received.
     - Driver Not Responding:
       - Condition: Task scheduled for today.
       - Reason: Driver not picking up calls or wrong driver assigned.
     - Desired Slot Not Available:
       - Condition: Task scheduled for today.
       - Reason: Customer wants to update the slot time.
     - Slot TAT Breached:
       - Condition: Task scheduled for today.
       - Reason: Task not completed within the allotted time slot.
     - Damaged Product:
       - Condition: Delivery task resolved today.
       - Reason: Delivered item was damaged.

4. Installation/Repair Tasks:
   - Escalation Condition: Only escalate if the task is scheduled for today.
   - Escalation Reason: Technician or carpenter callback not received.

5. Exceptions to Date Condition:
   - Escalate Regardless of Task Date for the Following Reasons:
     - Faulty Repair:
       - Condition: Repair task resolved, but customer claims faulty repair.
     - Faulty Replacement:
       - Condition: Replacement task resolved, but customer claims faulty replacement.
     - Repair Cancelled:
       - Condition: Repair ticket was cancelled.
     - Replacement Cancelled:
       - Condition: Replacement ticket was cancelled.
     - Replacement Not Scheduled:
       - Condition: Replacement ticket not scheduled within 24 hours of request.`,
  },
};
