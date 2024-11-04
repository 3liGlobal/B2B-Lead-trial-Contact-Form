// Production ERP Zoho Order
const fetch = require("node-fetch");
const pipelineId = "675378421";
const stageId = "994008282";

const hubspotBaseUrl = "https://api.hubapi.com";
const contactUrl = `${hubspotBaseUrl}/crm/v3/objects/contacts`;
const ticketUrl = `${hubspotBaseUrl}/crm/v3/objects/tickets`;
const API_KEY = "pat-eu1-c114cee4-4349-4d93-906c-e10d9c1649ba";

module.exports = async function (context, req) {
    var console=context
    var data = req.body;
    try {
      let contactId = await searchContactByEmail(data.properties.email);
      if (!contactId) {
        contactId = await createContact(data);
        console.log("New contact created:", contactId);
      } else {
        console.log("Contact already exists:", contactId);
      }
      const ticketId = await createTicket(data);
      console.log("New ticket created:", ticketId);
  
      await associateTicketWithContact(ticketId, contactId);
    } catch (error) {
      console.log("Error processing contact and ticket:", error);
    }
    context.res = {
        status: 200,
        body: "function executed successfully."
    };
    async function searchContactByEmail(email) {
        const searchUrl = `${contactUrl}/search`;
        try {
          const response = await fetch(searchUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filterGroups: [
                {
                  filters: [
                    { propertyName: "email", operator: "EQ", value: email },
                  ],
                },
              ],
            }),
          });
          const data = await response.json();
          console.log(data)
          if (data.results && data.results.length > 0) {
            return data.results[0].id; // Return the contact ID if found
          }
          return null; // Contact not found
        } catch (error) {
          console.log("Error searching for contact:", error);
          throw error;
        }
      }
      
      async function createContact(contactData) {
        try {
          const response = await fetch(contactUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(contactData),
          });
          const data = await response.json();
          return data.id; // Return the new contact ID
        } catch (error) {
          console.log("Error creating contact:", error);
          throw error;
        }
      }
      
      async function createTicket(contactData) {
        try {
          const response = await fetch(ticketUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                hs_pipeline: pipelineId,
                hs_pipeline_stage: stageId,
                subject: "New Ticket for Customer",
                message: contactData.properties.message,
              },
            }),
          });
          const data = await response.json();
          return data.id; 
        } catch (error) {
          console.log("Error creating ticket:", error);
          throw error;
        }
      }
      
      async function associateTicketWithContact(ticketId, contactId) {
        const associationUrl = `https://api.hubapi.com/crm/v4/objects/contact/${contactId}/associations/ticket/${ticketId}`;
      console.log(associationUrl)
        try {
      
        var asso=  await fetch(associationUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body:JSON.stringify([
              {
                "associationCategory": "HUBSPOT_DEFINED",
                "associationTypeId": 15
              }
            ])
          });
          console.log(await asso.json())
          console.log("Ticket associated with contact successfully.");
        } catch (error) {
          console.log("Error associating ticket with contact:", error);
          throw error;
        }
      }
};

