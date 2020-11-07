const express = require("express");
const cors = require("cors");
const db = require("./firebase");
const { Expo } = require("expo-server-sdk");
const axios = require("axios");

// require("dotenv").config();
const app = express();
// const port = process.env.port || 5101;
const expo = new Expo();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("requested");
  const result = reqTallyServer();
  // res.status(404).send();
  result
    .then((p, q) => {
      if (p.status === 200) {
        res.status(201).send();
      }
      console.log(p.status);
    })
    .catch((e) => {
      console.log(e);
      res.status(404).send();
    });
});

const reqTallyServer = async () => {
  const res = await axios.get("http://110.37.224.158:9000/");
  return res;
};

app.post("/post", (req, res) => {
  let chequeNumberJSON,
    chequeNumber = null;
  const [
    uidJSON,
    amountJSON,
    ledgerNameJSON,
    vchNumberJSON,
    checkedJSON,
    dateJSON,
  ] = req.query["_parts"];
  const [, uid] = JSON.parse(uidJSON);
  const [, amount] = JSON.parse(amountJSON);
  const [, ledgerName] = JSON.parse(ledgerNameJSON);
  const [, vchNumber] = JSON.parse(vchNumberJSON);
  const [, checked] = JSON.parse(checkedJSON);
  const [, date] = JSON.parse(dateJSON);
  if (checked === "Cheque") {
    [, , , , , , chequeNumberJSON] = req.query["_parts"];
    [, chequeNumber] = JSON.parse(chequeNumberJSON);
  }
  getName(uid, amount, ledgerName, vchNumber, checked, date, chequeNumber);
  console.log("Status");
  res.json({
    status: "500",
  });
});

const getName = async (
  uid,
  amount,
  ledgerName,
  vchNumber,
  checked,
  date,
  chequeNumber
) => {
  const user = await db.collection("users").doc(uid).get();

  const name = user.data().firstName;
  generateRecieptinTally(
    name,
    amount,
    ledgerName,
    vchNumber,
    checked,
    date,
    chequeNumber
  );

  console.log("Status se pehle");
};

const generateRecieptinTally = async (
  name,
  amount,
  ledgerName,
  vchNumber,
  checked,
  date,
  chequeNumber
) => {
  const cashReciept = `<ENVELOPE>
  <HEADER>
  <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
  <IMPORTDATA>
  <REQUESTDESC>
  <REPORTNAME>Vouchers</REPORTNAME>
  <STATICVARIABLES>
  <SVCURRENTCOMPANY>Dawood Fiber Mills</SVCURRENTCOMPANY>
  </STATICVARIABLES>
  </REQUESTDESC>
  <REQUESTDATA>
  <TALLYMESSAGE xmlns:UDF="TallyUDF">
  <VOUCHER VCHTYPE="Receipt" ACTION="Create" OBJVIEW="Accounting Voucher View">
  <DATE>${date}</DATE>
  <NARRATION>Recieved by ${name}</NARRATION>
  <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
  <VOUCHERNUMBER>1</VOUCHERNUMBER>
  <PARTYLEDGERNAME>${ledgerName}</PARTYLEDGERNAME>
  <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
  <EFFECTIVEDATE>${date}</EFFECTIVEDATE>
  <ALLLEDGERENTRIES.LIST>
  <LEDGERNAME>${ledgerName}</LEDGERNAME>
  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
  <AMOUNT>${amount}</AMOUNT>
  <BILLALLOCATIONS.LIST>
  <NAME>S-416-2019</NAME>
  <BILLTYPE>Agst Ref</BILLTYPE>
  <AMOUNT>${amount}</AMOUNT>
  </BILLALLOCATIONS.LIST>
  </ALLLEDGERENTRIES.LIST>
  <ALLLEDGERENTRIES.LIST>
  <LEDGERNAME>Cash Head Office</LEDGERNAME>
  <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
  <AMOUNT>-${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>
  </VOUCHER>
  </TALLYMESSAGE>
  </REQUESTDATA>
  </IMPORTDATA>
  </BODY>
  </ENVELOPE>`;

  const bankReciept = `<ENVELOPE>
  <HEADER>
      <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
          <IMPORTDATA>
              <REQUESTDESC>
              <REPORTNAME>Vouchers</REPORTNAME>
              <STATICVARIABLES>
                  <SVCURRENTCOMPANY>Dawood Fiber Mills</SVCURRENTCOMPANY>
              </STATICVARIABLES>
          </REQUESTDESC>
          <REQUESTDATA>
              <TALLYMESSAGE xmlns:UDF="TallyUDF">
                  <VOUCHER VCHTYPE="Receipt" ACTION="Create" OBJVIEW="Accounting Voucher View">
                      <DATE>${date}</DATE>
                      <NARRATION>Recieved By ${name}</NARRATION>
                      <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
                      <VOUCHERNUMBER>1</VOUCHERNUMBER>
                      <PARTYLEDGERNAME>${ledgerName}</PARTYLEDGERNAME>
                      <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                      <EFFECTIVEDATE>${date}</EFFECTIVEDATE>
                      <ALLLEDGERENTRIES.LIST>
                      <LEDGERNAME>${ledgerName}</LEDGERNAME>
                      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                      <AMOUNT>${amount}</AMOUNT>
                      <BILLALLOCATIONS.LIST>
                          <NAME>${vchNumber}</NAME>
                          <BILLTYPE>Agst Ref</BILLTYPE>
                          <AMOUNT>${amount}</AMOUNT>
                          </BILLALLOCATIONS.LIST>
                      </ALLLEDGERENTRIES.LIST>
                      <ALLLEDGERENTRIES.LIST>
                      <OLDAUDITENTRYIDS.LIST TYPE="Number">
                          <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
                          </OLDAUDITENTRYIDS.LIST>
                          <LEDGERNAME>BAHL</LEDGERNAME>
                          <GSTCLASS/>
                          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                          <LEDGERFROMITEM>No</LEDGERFROMITEM>
                          <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
                          <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                          <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
                          <AMOUNT>-${amount}</AMOUNT>
                          <BANKALLOCATIONS.LIST>
                          <DATE>${date}</DATE>
                          <INSTRUMENTDATE>${date}</INSTRUMENTDATE>
                          <NAME>71f2c7af-6bc2-4100-ac97-erywsai</NAME>
                          <TRANSACTIONTYPE>Cheque/DD</TRANSACTIONTYPE>
                          <PAYMENTFAVOURING>${ledgerName}</PAYMENTFAVOURING>
                          <INSTRUMENTNUMBER>${chequeNumber}</INSTRUMENTNUMBER>
                          <PAYMENTMODE>Transacted</PAYMENTMODE>
                          <BANKPARTYNAME>${ledgerName}</BANKPARTYNAME>
                          <CHEQUEPRINTED> 1</CHEQUEPRINTED>
                          <AMOUNT>-${amount}</AMOUNT>
                          </BANKALLOCATIONS.LIST>
                      </ALLLEDGERENTRIES.LIST>
                  </VOUCHER>
              </TALLYMESSAGE>
          </REQUESTDATA>
      </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const xmlReciept =
    checked === "Cash"
      ? cashReciept
      : checked === "Cheque"
      ? bankReciept
      : null;

  await axios("http://110.37.224.158:9000/", {
    method: "POST",
    data: xmlReciept,
    headers: {
      "Content-Type": "text/xml",
    },
  })
    .then((res) => {
      addToDb(name, amount, ledgerName, vchNumber, checked, date, chequeNumber);
      sendNotification(
        name,
        amount,
        ledgerName,
        vchNumber,
        checked,
        chequeNumber
      );
      console.log(res);
    })
    .catch((e) => console.log(e));
};

const sendNotification = async (
  name,
  amount,
  ledgerName,
  vchNumber,
  checked,
  chequeNumber
) => {
  let messages = [];
  const users = db.collection("users");
  await users.get().then(({ docs }) => {
    docs.forEach((doc) => {
      messages.push({
        to: doc.data().token[0].data,
        sound: "default",
        body: `A payment received by ${name} through ${checked} of ${amount} of ${ledgerName} against Voucher ${vchNumber}`,
        android: {
          channelId: "myChannelId",
        },
      });
      console.log(doc.data().token[0].data);
    });
  });
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

const addToDb = async (
  name,
  amount,
  ledgerName,
  vchNumber,
  checked,
  date,
  chequeNumber
) => {
  const res = await db.collection("reciepts").add({
    name: name,
    amount: amount,
    ledgerName: ledgerName,
    vchNumber: vchNumber,
    checked: checked,
    date: date,
    chequeNumber: chequeNumber,
  });
  console.log(res.id);
};

app.listen(process.env.port, () =>
  console.log(`Server is running in port: ${process.env.port}`)
);
