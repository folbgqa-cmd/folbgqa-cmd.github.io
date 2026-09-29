//+------------------------------------------------------------------+
//| GoldPriceBridge.mq5                                              |
//| يرسل سعر الذهب من MT5 إلى Firebase. لا ينفذ أي صفقات.             |
//+------------------------------------------------------------------+
#property strict
#property version "1.00"

input string InpSymbol = "XAUUSD"; // اسم الذهب عند وسيطك (مثلاً XAUUSD.m)
input string InpUrl    = "";       // https://YOUR-DB-default-rtdb.firebaseio.com/gold.json
input int    InpMs     = 500;      // فترة الفحص بالميلي ثانية
input int    InpBeatSec= 5;        // إرسال نبضة كل كم ثانية إذا ما تغير السعر

double   lastBid = 0, lastAsk = 0;
datetime lastSent = 0;

int OnInit()
{
   if(InpUrl == "")
   {
      Print("ضع رابط Firebase في InpUrl");
      return INIT_PARAMETERS_INCORRECT;
   }
   SymbolSelect(InpSymbol, true);
   EventSetMillisecondTimer(InpMs);
   Print("GoldPriceBridge started for ", InpSymbol);
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   MqlTick t;
   if(!SymbolInfoTick(InpSymbol, t)) return;

   bool changed = (t.bid != lastBid || t.ask != lastAsk);
   bool beat    = (TimeLocal() - lastSent >= InpBeatSec);
   if(!changed && !beat) return;

   int d = (int)SymbolInfoInteger(InpSymbol, SYMBOL_DIGITS);
   string js = "{\"bid\":" + DoubleToString(t.bid, d) +
               ",\"ask\":" + DoubleToString(t.ask, d) +
               ",\"digits\":" + IntegerToString(d) +
               ",\"symbol\":\"" + InpSymbol + "\"" +
               ",\"ts\":{\".sv\":\"timestamp\"}}";

   char post[], res[];
   string resHeaders;
   StringToCharArray(js, post, 0, StringLen(js), CP_UTF8);

   int code = WebRequest("PUT", InpUrl, "Content-Type: application/json\r\n", 3000, post, res, resHeaders);
   if(code == 200)
   {
      lastBid = t.bid; lastAsk = t.ask; lastSent = TimeLocal();
   }
   else
      Print("WebRequest failed. code=", code, " err=", GetLastError(),
            " | تأكد من إضافة الرابط في Tools > Options > Expert Advisors");
}
