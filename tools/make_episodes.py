#!/usr/bin/env python3
"""Source of truth for the DIGITVL Stores promo scripts. Writes episodes/dvsNN.json.
Claims policy: only what exists today (guided wizard + AI chat setup, real Printful catalog products, drafts that need the owner's price
confirmation, free <name>.digitvl.com address, optional own domain). Product visuals are clean mockups (NOT 3D renders: those are planned)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CREDIT = ('Music: "{t}" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License\n'
          'http://creativecommons.org/licenses/by/4.0/')
# bar-aligned start of the loudest 40 s window of each track (measured with ffmpeg + numpy, see tools/README)
MUSIC_START = {"Newer_Wave": 89.45, "Adventure_Meme": 0, "Funk_Game_Loop": 0, "Jaunty_Gumption": 64.11}
eps = {}


def ep(id, title, line, tags, music, sents, scenes):
    eps[id] = {"id": id, "title": title, "desc": line, "hashtags": tags, "music": music,
               "sentences": [{"text": t, "scene": s} for t, s in sents], "scenes": scenes}


def hook(*lines):
    return {"type": "hook", "lines": list(lines)}


CTA = {"type": "cta"}

ep("dvs01", "Launch Your Artist Merch Store In Minutes",
   "Launch an artist merch store in minutes: sign up, pick products, add your logo, set prices. Real print-on-demand products, no inventory.",
   ["#artistmerch", "#printondemand"], "Newer_Wave",
   [("Launch your own merch store in minutes.", "hook"), ("No developer. No inventory. No waiting.", "hook"),
    ("Step one, sign up and pick your store name.", "steps"), ("Step two, choose your products. Tees, hoodies, mugs, posters.", "steps"),
    ("Step three, drop in your logo and set your prices.", "steps"), ("Your store gets its own address.", "addr"),
    ("The setup is guided, and an AI can build it with you in chat.", "chat"), ("Open your store at stores.digitvl.com", "cta")],
   {"hook": hook("LAUNCH YOUR", "MERCH STORE", "IN MINUTES"),
    "steps": {"type": "steps", "title": "HOW IT WORKS", "steps": [
        {"t": "Sign up", "s": "pick your store name"}, {"t": "Choose products", "s": "tees, hoodies, mugs, posters"},
        {"t": "Add logo + prices", "s": "you set every price"}]},
    "addr": {"type": "address", "sub": "yourname"},
    "chat": {"type": "chat", "user": "Dark, minimal, red and black. Hoodies and tees.", "ai": "Done. Your draft store is ready to review.",
             "chips": ["Hoodie", "T-shirt", "Mug"]},
    "cta": CTA})

ep("dvs02", "See Your Logo On A Real Hoodie Before You Spend A Dollar",
   "See your logo on real print-on-demand products before anything is made. Nothing prints until a fan orders.",
   ["#merch", "#printondemand"], "Adventure_Meme",
   [("See your logo on a real hoodie before you spend a dollar.", "hook"), ("Upload your logo once.", "hero"),
    ("DIGITVL Stores places it on real product templates. Tees, hoodies, mugs, even tote bags.", "prod"),
    ("You see exactly what your fans would get.", "prod"),
    ("Nothing gets printed until someone actually orders.", "flow"), ("So there's no stock to buy, and nothing to risk.", "flow"),
    ("Start yours at stores.digitvl.com", "cta")],
   {"hook": hook("YOUR LOGO", "ON A REAL HOODIE", "BEFORE YOU SPEND", "A DOLLAR"),
    "hero": {"type": "hero", "item": "hoodie", "caption": "Your logo, placed on the product"},
    "prod": {"type": "products", "title": "REAL PRODUCT TEMPLATES", "items": ["tee", "hoodie", "mug", "tote", "cap", "poster"]},
    "flow": {"type": "flow", "title": "PRINTED ONLY WHEN ORDERED", "nodes": [
        {"i": "cart", "t": "A fan orders", "s": "on your store"}, {"i": "print", "t": "It gets printed", "s": "only then"},
        {"i": "box", "t": "It ships to them", "s": "you hold no stock"}]},
    "cta": CTA})

ep("dvs03", "Your Free artistname.digitvl.com Merch Store",
   "Every DIGITVL store gets its own free address, yourname.digitvl.com. Your own domain is optional.",
   ["#artistmerch", "#linkinbio"], "Funk_Game_Loop",
   [("Your fans can find you at artistname.digitvl.com", "hook"), ("No website builder to learn. No hosting to set up.", "addr"),
    ("Pick your name when you sign up, and the address is yours.", "addr"),
    ("Want your own domain? That's optional. Request it and connect it to the same store.", "dom"),
    ("Put the link in your bio, your videos, your tour posters.", "prod"), ("One link. Your whole merch shop.", "prod"),
    ("Claim your name at stores.digitvl.com", "cta")],
   {"hook": hook("YOUR OWN LINK", "ARTISTNAME", ".DIGITVL.COM"),
    "addr": {"type": "address", "sub": "artistname", "big": True},
    "dom": {"type": "address", "sub": "artistname", "custom": "yourname.com", "big": True},
    "prod": {"type": "products", "title": "ONE LINK, WHOLE SHOP", "items": ["tee", "hoodie", "mug", "cap"]},
    "cta": CTA})

ep("dvs04", "Tell An AI Your Vibe, Get A Merch Store",
   "Tell the DIGITVL Stores AI your vibe and it drafts your merch store. Nothing goes live until you confirm your prices.",
   ["#aitools", "#artistmerch"], "Jaunty_Gumption",
   [("Tell an AI your vibe, and it builds your merch store.", "hook"), ("Describe your brand in plain words. Dark, minimal, red and black.", "chat"),
    ("It picks real products, matches colors that exist in the catalog, and drafts the whole store.", "prod"),
    ("Then it stops. Nothing goes live until you confirm your prices.", "price"),
    ("You stay the boss. The AI just does the busywork.", "price"), ("Chat with it at stores.digitvl.com", "cta")],
   {"hook": hook("TELL AN AI", "YOUR VIBE.", "GET A STORE."),
    "chat": {"type": "chat", "user": "Dark, minimal, red and black. Hoodies and tees.", "ai": "Got it. I'm drafting your store now.",
             "chips": ["Hoodie", "T-shirt", "Tote"]},
    "prod": {"type": "products", "title": "DRAFT STORE", "items": ["hoodie", "tee", "tote"], "draft": True},
    "price": {"type": "price"}, "cta": CTA})

ep("dvs05", "Why Print On Demand Means Zero Inventory",
   "Print on demand explained: a fan orders, then it is printed and shipped. You never hold stock.",
   ["#printondemand", "#merch"], "Funk_Game_Loop",
   [("Stop buying two hundred hoodies you might never sell.", "hook"), ("Print on demand flips it.", "cmp"),
    ("A fan orders. Then it gets printed, packed and shipped.", "flow"), ("You never hold stock. You never pack a box.", "flow"),
    ("That means no upfront bill for inventory, and no leftovers.", "prod"),
    ("DIGITVL Stores connects to real Printful products, so you start with real catalog items.", "prod"),
    ("Start at stores.digitvl.com", "cta")],
   {"hook": hook("STOP BUYING", "200 HOODIES"),
    "cmp": {"type": "compare", "left": {"t": "THE OLD WAY", "l": ["Buy 200 hoodies", "Store the boxes", "Hope they sell"]},
            "right": {"t": "PRINT ON DEMAND", "l": ["Fan orders", "Printed for them", "Shipped to them"]}},
    "flow": {"type": "flow", "title": "HOW IT WORKS", "nodes": [
        {"i": "cart", "t": "A fan orders", "s": "on your store"}, {"i": "print", "t": "It gets printed", "s": "on demand"},
        {"i": "box", "t": "It ships", "s": "straight to them"}]},
    "prod": {"type": "products", "title": "REAL PRINTFUL PRODUCTS", "items": ["hoodie", "tee", "mug", "cap", "tote", "poster"]},
    "cta": CTA})

ep("dvs06", "Sell Merch Without A Website Developer",
   "You do not need a developer to sell merch: DIGITVL Stores gives you a storefront, product pages and checkout, already built.",
   ["#artistmerch", "#nocode"], "Adventure_Meme",
   [("Want to sell merch but can't code?", "hook"), ("You don't need a developer.", "hook"),
    ("DIGITVL Stores gives you a storefront, product pages, and checkout, already built.", "check"),
    ("You bring the name and the logo.", "check"),
    ("The store builds itself from a short setup, or a chat with the AI.", "chat"), ("Then you set your prices and publish.", "chat"),
    ("Build yours at stores.digitvl.com", "cta")],
   {"hook": hook("SELL MERCH", "WITHOUT A", "DEVELOPER"),
    "check": {"type": "checklist", "title": "ALREADY BUILT FOR YOU", "items": ["Storefront", "Product pages", "Checkout", "Your own address"]},
    "chat": {"type": "chat", "user": "Streetwear brand for my music. Tees and hoodies.", "ai": "Draft ready. Review it, set prices, publish.",
             "chips": ["Tee", "Hoodie", "Mug"]},
    "cta": CTA})

ep("dvs07", "The Tech Behind An AI-Built Merch Store",
   "The tech behind a DIGITVL store explained simply: chat setup, an AI draft, real Printful products, your own address, built-in checkout.",
   ["#aitools", "#techexplained"], "Newer_Wave",
   [("Here's the tech behind a DIGITVL store, in plain English.", "hook"),
    ("One. You chat, or fill a short form. That's the whole setup.", "stack"),
    ("Two. An AI turns your answers into a draft store.", "stack"),
    ("Three. Real print on demand products from Printful fill the shelves.", "stack"),
    ("Four. Your store goes up at your own address.", "stack"), ("Five. Checkout and shipping are built in.", "stack"),
    ("You approve every price. See it at stores.digitvl.com", "cta")],
   {"hook": hook("THE TECH BEHIND", "AN AI", "MERCH STORE"),
    "stack": {"type": "stack", "title": "THE STACK, SIMPLY", "nodes": [
        {"i": "chat", "t": "Chat or form", "s": "you describe your brand"}, {"i": "ai", "t": "AI draft", "s": "turns answers into a store"},
        {"i": "box", "t": "Real products", "s": "Printful catalog"}, {"i": "globe", "t": "Your address", "s": "yourname.digitvl.com"},
        {"i": "cart", "t": "Checkout", "s": "orders and shipping built in"}]},
    "cta": CTA})

ep("dvs08", "5 Merch Setup Jobs The AI Does For You",
   "The DIGITVL Stores AI handles the boring setup jobs for your merch store. You approve every price.",
   ["#aitools", "#artistmerch"], "Jaunty_Gumption",
   [("Merch setup is five boring jobs. Let the AI do them.", "hook"),
    ("One, picking products that actually exist in the catalog.", "list"), ("Two, matching your colors to real garment colors.", "list"),
    ("Three, filling in your brand details from a chat.", "list"), ("Four, suggesting prices above a safe floor.", "list"),
    ("Five, putting everything in a draft for you to review.", "list"),
    ("You do one thing. Say yes. Start at stores.digitvl.com", "cta")],
   {"hook": hook("5 JOBS", "THE AI DOES", "FOR YOU"),
    "list": {"type": "checklist", "title": "DONE BY THE AI", "numbered": True,
             "items": ["Real catalog products", "Real garment colors", "Brand details from chat", "Prices above a safe floor", "Draft store to review"]},
    "cta": CTA})

# ---- reserve bank (dvs09+): rendered but NOT queued now; the cloud orchestrator posts them at 1 promo : 3 entertainment Shorts
ep("dvs09", "How To Price Merch So You Never Sell At A Loss",
   "The DIGITVL Stores AI suggests merch prices above a safe floor. You confirm every price before anything goes live.",
   ["#merchtips", "#aitools"], "Newer_Wave",
   [("Most artists guess their merch prices.", "hook"), ("Here's a better way.", "hook"),
    ("DIGITVL Stores looks at what each product costs to make and ship.", "price"),
    ("Then it suggests a price above a safe floor, so you don't sell at a loss.", "price"),
    ("You can move the price up or down, and you confirm every one.", "price"),
    ("Nothing goes live until you say yes.", "check"), ("Your brand, your prices, no surprises.", "check"),
    ("Try it at stores.digitvl.com", "cta")],
   {"hook": hook("STOP GUESSING", "YOUR MERCH", "PRICES"), "price": {"type": "price"},
    "check": {"type": "checklist", "title": "YOU STAY IN CONTROL", "items": ["Suggested price above the floor", "You adjust it", "You confirm it", "Then it goes live"]}, "cta": CTA})

ep("dvs10", "Pick Your Merch Colors From Real Garment Colors",
   "The DIGITVL Stores setup matches your brand colors to real garment colors in the print-on-demand catalog.",
   ["#artistmerch", "#branding"], "Adventure_Meme",
   [("Your merch should match your brand.", "hook"), ("Dark and minimal? Bright and loud?", "hook"),
    ("Tell the AI your vibe, and it matches it to colors that really exist in the catalog.", "chat"),
    ("So the hoodie you preview is a hoodie you can actually sell.", "prod"),
    ("Add your logo, and see it on tees, hoodies, mugs and more.", "prod"),
    ("Then review the draft and publish when you're happy.", "prod"), ("Start your store at stores.digitvl.com", "cta")],
   {"hook": hook("MERCH THAT", "MATCHES", "YOUR BRAND"),
    "chat": {"type": "chat", "user": "Loud and bright. Streetwear. Tees and caps.", "ai": "Matching your vibe to real catalog colors.", "chips": ["T-shirt", "Hoodie", "Mug"]},
    "prod": {"type": "products", "title": "REAL CATALOG COLORS", "items": ["tee", "hoodie", "cap", "mug"]}, "cta": CTA})

ep("dvs11", "Why Your Link In Bio Should Be A Merch Store",
   "Give fans a place to buy: a DIGITVL store with your own free address, ready for your bio.",
   ["#linkinbio", "#artistmerch"], "Funk_Game_Loop",
   [("Your link in bio is prime real estate.", "hook"), ("What's it sending fans to?", "hook"),
    ("Point it at your own store, at artistname.digitvl.com", "addr"),
    ("Fans see your logo on real products, not a list of links.", "prod"),
    ("You pick the products, set the prices, and approve the store.", "prod"),
    ("Printing and shipping happen only when someone orders.", "flow"),
    ("Make your link do more at stores.digitvl.com", "cta")],
   {"hook": hook("YOUR BIO LINK", "SHOULD SELL", "MERCH"), "addr": {"type": "address", "sub": "artistname", "big": True},
    "prod": {"type": "products", "title": "YOUR LOGO, REAL PRODUCTS", "items": ["tee", "hoodie", "mug", "tote", "cap", "poster"]},
    "flow": {"type": "flow", "title": "PRINTED WHEN ORDERED", "nodes": [{"i": "cart", "t": "A fan orders", "s": "on your store"}, {"i": "print", "t": "It gets printed", "s": "on demand"}, {"i": "box", "t": "It ships", "s": "you hold no stock"}]}, "cta": CTA})

ep("dvs12", "Start A Merch Brand With Zero Stock And An AI Helper",
   "Start an artist merch brand with no stock: guided setup or AI chat, real print-on-demand products, your own address.",
   ["#merch", "#aitools"], "Jaunty_Gumption",
   [("Starting a merch brand sounds expensive.", "hook"), ("It doesn't have to be.", "hook"),
    ("With print on demand there's no stock to buy.", "cmp"), ("With an AI helper there's no developer to hire.", "chat"),
    ("You choose products, add your logo, and set your prices.", "steps"),
    ("Your store gets its own address, and you approve it before it goes live.", "addr"),
    ("Begin at stores.digitvl.com", "cta")],
   {"hook": hook("START A MERCH", "BRAND WITH", "ZERO STOCK"),
    "cmp": {"type": "compare", "left": {"t": "THE OLD WAY", "l": ["Buy stock upfront", "Hire a developer", "Hope it sells"]}, "right": {"t": "DIGITVL STORES", "l": ["No stock to buy", "AI-guided setup", "You approve it"]}},
    "chat": {"type": "chat", "user": "Merch brand for my band. Dark and minimal.", "ai": "Great. Drafting your store for review.", "chips": ["Tee", "Hoodie", "Mug"]},
    "steps": {"type": "steps", "title": "THREE MOVES", "steps": [{"t": "Choose products", "s": "from the real catalog"}, {"t": "Add your logo", "s": "see it on the product"}, {"t": "Set your prices", "s": "you confirm each one"}]},
    "addr": {"type": "address", "sub": "yourband"}, "cta": CTA})

# (insert_before_index, text, scene): second pass to reach 30-45 s at the approved narrator pace (~3 words/s)
EXTRA = {
    "dvs01": [(6, "That looks like yourname.digitvl.com, and the address is free.", "addr"), (7, "You bring the idea. The platform does the heavy lifting.", "chat")],
    "dvs02": [(2, "Pick a product, and your design drops right on.", "hero"), (6, "Preview first. Print later. That's the whole idea.", "flow")],
    "dvs03": [(3, "Your fans type one short link and land in your shop.", "addr"), (7, "Free to claim. Easy to remember. All yours.", "prod")],
    "dvs04": [(2, "It can fill in your brand details as you talk.", "chat"), (5, "Prices are suggested above a safe floor, and the final call is yours.", "price")],
    "dvs05": [(2, "No boxes, no garage full of merch, no guessing sizes.", "cmp"), (6, "Fewer risks, and more time making music.", "prod")],
    "dvs06": [(2, "Websites used to take weeks and a lot of money.", "hook"), (6, "Your store, live at your own address, without writing a line of code.", "chat")],
    "dvs07": [(1, "No jargon. Just the five pieces that matter.", "hook"), (6, "Simple parts, working together, so you can focus on your art.", "stack")],
    "dvs08": [(1, "Here they are, one by one.", "hook"), (6, "Less setup. More time creating.", "list")],
    "dvs09": [(3, "Printing and shipping costs are already counted in.", "price"), (7, "Fair prices for you, and for your fans.", "check")],
    "dvs10": [(2, "Pick a color you love, then find the product doesn't come in it. Frustrating.", "hook"), (6, "No more mockups of things you can't actually sell.", "prod")],
    "dvs11": [(3, "Every post, every video, every story can lead to one place.", "addr"), (7, "One link. Real products. A store that's yours.", "flow")],
    "dvs12": [(2, "Here's the simple version.", "hook"), (6, "No big bill up front, and no boxes of stock at home.", "addr")],
}
for _id, ins in EXTRA.items():
    for idx, text, scene in sorted(ins, reverse=True):
        eps[_id]["sentences"].insert(idx, {"text": text, "scene": scene})

if __name__ == "__main__":
    (ROOT / "episodes").mkdir(exist_ok=True)
    for k, v in eps.items():
        if k == "dvs12":
            v["hold"] = 6.2
        elif k in ("dvs09", "dvs10", "dvs11"):
            v["hold"] = 5.0
        if k == "dvs06":
            v["hold"] = 4.8  # shortest voice track: longer end card keeps it >= 30 s
        v["musicStart"] = MUSIC_START[v["music"]]
        v["musicCredit"] = CREDIT.format(t=v["music"].replace("_", " "))
        (ROOT / "episodes" / f"{k}.json").write_text(json.dumps(v, indent=1, ensure_ascii=False), encoding="utf-8")
        print(k, sum(len(s["text"].split()) for s in v["sentences"]), "words")
