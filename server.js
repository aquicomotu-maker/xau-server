const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());

let state = {
  signal: null, bos: false, fvg: false, swp: false,
  tp_hit: false, sl_hit: false, price: null, timestamp: null
};

app.post("/webhook", (req, res) => {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) {
      const t = body.toUpperCase();
      if (t.includes("BUY"))  state = {...state, signal:"BUY",  bos:true,fvg:true,swp:true,tp_hit:false,sl_hit:false,timestamp:Date.now()};
      if (t.includes("SELL")) state = {...state, signal:"SELL", bos:true,fvg:true,swp:true,tp_hit:false,sl_hit:false,timestamp:Date.now()};
      if (t.includes("TP"))   state = {...state, signal:null,tp_hit:true, sl_hit:false,timestamp:Date.now()};
      if (t.includes("SL"))   state = {...state, signal:null,sl_hit:true, tp_hit:false,timestamp:Date.now()};
      return res.json({ ok:true, state });
    }
  }
  const type = (body.type||"").toUpperCase();
  if (type==="BUY_APLUS")  state = {signal:"BUY", bos:true,fvg:true,swp:true,tp_hit:false,sl_hit:false,price:body.price,timestamp:Date.now()};
  if (type==="SELL_APLUS") state = {signal:"SELL",bos:true,fvg:true,swp:true,tp_hit:false,sl_hit:false,price:body.price,timestamp:Date.now()};
  if (type==="TP_HIT")     state = {...state,signal:null,tp_hit:true, sl_hit:false,timestamp:Date.now()};
  if (type==="SL_HIT")     state = {...state,signal:null,sl_hit:true, tp_hit:false,timestamp:Date.now()};
  if (type==="RESET")      state = {signal:null,bos:false,fvg:false,swp:false,tp_hit:false,sl_hit:false,price:null,timestamp:Date.now()};
  console.log(new Date().toISOString(), type, "→", state.signal);
  res.json({ ok:true, state });
});

app.get("/state", (req, res) => res.json(state));
app.post("/reset", (req, res) => {
  state = {signal:null,bos:false,fvg:false,swp:false,tp_hit:false,sl_hit:false,price:null,timestamp:Date.now()};
  res.json({ok:true});
});
app.get("/", (req, res) => res.json({ status:"XAU Webhook OK" }));

app.listen(process.env.PORT||3000, () => console.log("✅ Servidor XAU listo"));
