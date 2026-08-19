# Campus Book Drop

A three-sided marketplace for used college textbooks: students list books they're done with, other students buy them, and a third group of volunteers ("Book Heroes") handles the pickup and delivery between hostel rooms.

Built solo and deployed at `campusbookdrop.store`, where it ran for hostels on the MNNIT Allahabad campus through 2023.

> **Status: archived.** The domain is no longer registered and order placement is switched off in code (`views/order_placing/index.ejs`). The repository is kept as a record of the build.

## The idea

Textbooks get bought once and used for a semester. After that they sit in a hostel room until the student graduates, because selling them means finding a buyer, agreeing on a price, and physically meeting up. Most people don't bother.

Campus Book Drop removed the meeting-up part. A seller lists a book and leaves it in their room. A buyer orders it. A Book Hero collects it from the seller's room and drops it at the buyer's. Nobody has to coordinate schedules with a stranger.

That constraint is why the address model is a room number and a hostel code (`TH`, `MH`, `PH`, `SVBH`) rather than a street address, and why books are tagged by programme, branch, year, and semester instead of ISBN. The catalogue was built around one campus and its course structure.

## How an order moved through the system

Ordering is deliberately unusual, because there was no payment gateway. Everything below is real behaviour in `controllers/order_placing.js`.

1. The buyer builds a cart. Logged-out visitors get a session cart, which is merged into their account on login.
2. At checkout the server mints a UUID, keeps it, and sends the buyer a bcrypt hash of it. The buyer's order submission has to carry that hash back, which is compared against the stored token before the order is accepted. This blocks direct POSTs to the order endpoint.
3. The buyer picks a saved address or adds one.
4. The buyer scans a merchant UPI QR code, pays out of band, then uploads a screenshot of the payment receipt. Multer holds the file in memory and streams it to Cloudinary.
5. The order is created with status `processing` and the comment "Your payment is being verified." A parallel `DeliveryOrder` is created with status `open`, carrying the seller's pickup address and the buyer's shipping address.
6. Once payment is verified, the delivery order becomes visible to Book Heroes.

A Book Hero then walks the delivery through a state machine in `setDeliveryOrderStatus`: `open` to `locked` (claiming it, a commitment to deliver within a day), `locked` to `pickedup`, `pickedup` to `delivered`. Transitions out of order are rejected. Sellers were paid to their saved UPI ID after the buyer's five-day return window closed, minus a 7% service fee.

Delivery pricing inverts the usual rule to push basket size up. One to three books cost ₹15 to deliver, four or more cost ₹8, and a user's first order ships free. The constants live at the top of `app.js`.

## Stack

Server-rendered Express, no frontend framework.

- Node.js and Express 4, with EJS and `ejs-mate` for layouts
- MongoDB via Mongoose 7
- Passport with `passport-local-mongoose` for auth, sessions persisted to Mongo through `connect-mongo`
- Cloudinary for every uploaded image (book covers, avatars, payment receipts)
- Nodemailer over Hostinger SMTP for OTPs, password resets, and welcome mail
- Joi for request body validation, Helmet for headers and CSP, `express-mongo-sanitize` against operator injection
- Bootstrap 5.3 and axios from CDN

61 route handlers across 11 route files, with logic in `controllers/` and Mongoose models in `db_models/`.

## Running it locally

```bash
git clone https://github.com/Exyons/CampusBookDrop.git
cd CampusBookDrop
npm install
cp .env.example .env    # then fill in the values
npm start
```

Runs on `http://localhost:4000` unless `PORT` says otherwise.

Outside production the app connects to `mongodb://127.0.0.1:27017/BookSellingApp`, so a local `mongod` is enough to boot. Cloudinary and SMTP credentials are still needed for anything involving uploads or email, including signup, which sends an OTP.

There is no seed script in the repository, so the books page starts empty. To see a populated catalogue, sign up, switch your account to a seller through the Join Us page, and list books from the dashboard.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Set to `production` to enable secure cookies, the proxy trust flag, Google Analytics, and the production Cloudinary folder. Anything else loads `.env` via dotenv. |
| `MONGODB_URL` | Connection string. Read only when `NODE_ENV=production`. |
| `SESSION_SECRET` | Signing secret for `express-session`. |
| `PORT` | HTTP port. Defaults to 4000. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name. Also interpolated into the CSP `img-src` directive. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `HOSTINGER_NOREPLY_EMAIL` | SMTP user for automated mail (OTPs, password resets). |
| `HOSTINGER_NOREPLY_PASSWORD` | Password for the above. |
| `HOSTINGER_INFO_EMAIL` | SMTP user for contact and welcome mail. |
| `HOSTINGER_INFO_PASSWORD` | Password for the above. |
| `GA_MEASUREMENT_ID` | Google Analytics measurement ID. The analytics snippet renders only when this is set and `NODE_ENV=production`. |

## Layout

```
app.js              Express setup, middleware chain, route mounting, pricing constants
middlewares.js      Auth guards, filter-query builder, Joi validators, upload cleanup
routes/             Thin routers, one per feature area
controllers/        Request handlers
db_models/          Mongoose schemas: user, product, order, delivery_order, address
joi_schema/         Validation schemas for signup, book, and address payloads
views/              EJS templates and partials
public/             Client JS, CSS, images, and the PWA manifest
```

## Details worth pointing at

**Infinite scroll without an API.** `/books/loadBooks` renders `product_card.ejs` server-side with `ejs.renderFile`, six cards at a time, and returns the HTML strings as JSON. The client appends them. Card markup is defined once and used by the catalogue, the search page, and the filter endpoint.

**Cart survives login.** Anonymous carts live in the session. `updateUserCart` runs after Passport authenticates and folds the session cart into the user document, so adding books before signing in doesn't lose them.

**Cascading account deletion.** A `post('findOneAndDelete')` hook on the user schema tears down saved addresses, orders, listed products, and every associated Cloudinary asset. Deleting an account leaves nothing orphaned.

**Orphan upload cleanup.** Images are pushed to Cloudinary before the form that references them is submitted. The `deleteImages` middleware runs on every request and destroys any upload the user abandoned by navigating away.

**Email OTP at signup.** Six digits from `crypto.randomInt`, ten-minute expiry, one-minute resend cooldown, deleted on successful verification so it can't be replayed.

**Locked-down CSP.** Helmet's content security policy is written out by hand rather than left at defaults, with an allowlist covering the Bootstrap and jsDelivr CDNs, Google Analytics, and the project's own Cloudinary account.

**SEO and PWA.** A web manifest with maskable icons, a sitemap, canonical URLs, Open Graph tags, and JSON-LD `WebSite` markup with a `SearchAction` pointing at the book search endpoint.

## Known limitations

Worth stating plainly, since the code is public.

Per-request state is stored on `app.locals`, which Express shares across every request and every user. The order token, the in-flight cart, the selected address, the uploaded receipt, and the book pagination counter all live there. With one order at a time this works. With two concurrent checkouts it does not, and fixing it means moving that state into the session or the database.

The session store's crypto option is spelled `secrete` in `app.js`, so `connect-mongo` never applies the encryption that was intended.

The validators in `middlewares.js` throw `ExpressError` without importing it, so a failed Joi check raises a `ReferenceError` instead of returning a 400.

In `orderPlaceConfirmation`, stock is decremented by one per line item regardless of the quantity ordered, and only the last product in the loop is saved.

`public/backup/` holds 4.2 MB of duplicated client JavaScript, both original and minified, that should never have been committed. There are no automated tests.

## License

MIT. See [LICENSE](LICENSE).
