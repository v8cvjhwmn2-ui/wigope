export const company = {
  legalName: 'Wigope Technologies Pvt Ltd',
  brandName: 'Wigope Recharge',
  cin: 'U63999UP2025PTC238367',
  email: 'support@wigope.com',
  phone: '+91 9568 654684',
  phoneE164: '919568654684',
  whatsappUrl: 'https://wa.me/919568654684',
  mainWebsite: 'https://wigope.com'
};

export const servicePages = [
  {
    slug: 'mobile-recharge',
    title: 'Mobile Recharge',
    short: 'Prepaid recharges for Indian mobile users.',
    category: 'Recharge',
    icon: '/assets/services/prepaid_recharges.png',
    description:
      'Recharge prepaid mobile numbers with operator detection, plan selection, wallet flow and instant transaction status updates.',
    bullets: ['Prepaid operator support', 'Plan-led recharge flow', 'Wallet and UPI-ready checkout', 'Instant confirmation tracking']
  },
  {
    slug: 'dth-recharge',
    title: 'DTH Recharge',
    short: 'DTH/D2H packs for home entertainment.',
    category: 'Recharge',
    icon: '/assets/services/dth_d2h_recharges.png',
    description:
      'Pay DTH and D2H operator recharges from one clean Wigope interface with receipt-ready status history.',
    bullets: ['DTH operator catalogue', 'Subscriber ID validation', 'Recharge history', 'Support-ready receipts']
  },
  {
    slug: 'fastag-recharge',
    title: 'FASTag Recharge',
    short: 'Recharge toll wallets quickly.',
    category: 'Bills',
    icon: '/assets/services/fastag_recharges.png',
    description:
      'Enable FASTag recharge journeys for supported providers with payment tracking and refund-ready transaction records.',
    bullets: ['Vehicle and provider flow', 'Payment status tracking', 'Failed recharge reversal', 'Customer support records']
  },
  {
    slug: 'electricity-bill',
    title: 'Electricity Bill',
    short: 'Electricity board payments.',
    category: 'Bills',
    icon: '/assets/services/electricity_payments.png',
    description:
      'Pay supported electricity billers through a bill-fetch-first experience designed for clarity and fewer customer mistakes.',
    bullets: ['Biller search', 'Consumer number input', 'Bill fetch support', 'Receipt and status timeline']
  },
  {
    slug: 'water-bill',
    title: 'Water Bill',
    short: 'Water utility bill payments.',
    category: 'Bills',
    icon: '/assets/services/water_payments.png',
    description:
      'Support water utility bill payment flows with clean bill details, due amount visibility and customer-friendly history.',
    bullets: ['Utility biller selection', 'Consumer details', 'Due amount display', 'Payment status history']
  },
  {
    slug: 'gas-bill',
    title: 'Gas Bill',
    short: 'Piped gas and LPG related payments.',
    category: 'Bills',
    icon: '/assets/services/gas_cylinder_booking.png',
    description:
      'Offer gas bill and cylinder booking payment journeys with secure checkout and consistent support records.',
    bullets: ['Gas provider list', 'Consumer validation', 'Wallet and UPI-ready', 'Refund support']
  },
  {
    slug: 'broadband-landline',
    title: 'Broadband & Landline',
    short: 'Internet and landline bill payments.',
    category: 'Bills',
    icon: '/assets/services/postpaid_payments.png',
    description:
      'Let customers pay broadband and landline bills from the same Wigope Recharge surface.',
    bullets: ['Biller-led forms', 'Bill amount capture', 'Payment tracking', 'Support escalation path']
  },
  {
    slug: 'credit-card-bill',
    title: 'Credit Card Bill',
    short: 'Credit card payment support.',
    category: 'Payments',
    icon: '/assets/services/credit_card_payment.png',
    description:
      'Prepare credit card bill payment journeys with clear customer input, payment disclosures and transaction records.',
    bullets: ['Card bill flow', 'Secure payment screen', 'Transaction records', 'Failure handling']
  },
  {
    slug: 'insurance-payments',
    title: 'Insurance Payments',
    short: 'Insurance premium payment journeys.',
    category: 'Payments',
    icon: '/assets/services/insurance_payments.png',
    description:
      'Support insurance premium payments with a structured customer-friendly form and traceable transaction status.',
    bullets: ['Policy details capture', 'Provider support', 'Payment status', 'Receipt-ready history']
  },
  {
    slug: 'loan-emi',
    title: 'Loan EMI',
    short: 'Loan repayment and EMI payment flows.',
    category: 'Payments',
    icon: '/assets/services/see_all.png',
    description:
      'Enable EMI repayment journeys with clear amount entry, confirmation, payment tracking and support records.',
    bullets: ['Loan provider flow', 'Amount confirmation', 'Status timeline', 'Complaint support']
  },
  {
    slug: 'gift-cards',
    title: 'Gift Cards & Vouchers',
    short: 'Shopping, food and lifestyle vouchers.',
    category: 'Rewards',
    icon: '/assets/brands/see_all_tile.png',
    description:
      'Gift cards and voucher discovery through Wigope Rewards, powered by Hubble rewards integration.',
    bullets: ['Gift card marketplace', 'Brand discovery', 'Voucher history', 'Hubble-powered rewards']
  },
  {
    slug: 'ott-vouchers',
    title: 'OTT Vouchers',
    short: 'Entertainment and subscription vouchers.',
    category: 'Rewards',
    icon: '/assets/brands/ott_prime.png',
    description:
      'Feature OTT and entertainment vouchers including streaming and subscription gift cards through the Wigope rewards flow.',
    bullets: ['OTT catalogue', 'Entertainment vouchers', 'Reward discovery', 'Customer support path']
  },
  {
    slug: 'refer-and-earn',
    title: 'Refer & Earn',
    short: 'Referral-led reward discovery.',
    category: 'Rewards',
    icon: '/assets/brands/see_all_tile.png',
    description:
      'Wigope referral flows help customers invite friends, discover rewards and keep track of eligible benefits.',
    bullets: ['Referral code sharing', 'Reward eligibility', 'Invite tracking', 'Customer education']
  },
  {
    slug: 'wallet',
    title: 'Wallet & Add Money',
    short: 'Wallet topup and payment-ready balance.',
    category: 'Wallet',
    icon: '/assets/services/credit_card_payment.png',
    description:
      'A payment gateway-ready wallet experience for topups, ledger records, refunds and recharge checkout support.',
    bullets: ['Add money flow', 'Wallet ledger', 'Refund tracking', 'Payment gateway ready']
  }
];

export const voucherBrands = [
  { name: 'Amazon', image: '/assets/brands/voucher_amazon_new.png', offer: 'Gift cards' },
  { name: 'Flipkart', image: '/assets/brands/voucher_flipkart_new.png', offer: 'Shopping' },
  { name: 'Myntra', image: '/assets/brands/voucher_myntra_new.png', offer: 'Fashion' },
  { name: "Domino's", image: '/assets/brands/voucher_dominos_new.png', offer: 'Food' },
  { name: 'Swiggy', image: '/assets/brands/voucher_swiggy_new.png', offer: 'Food' },
  { name: 'Zomato', image: '/assets/brands/voucher_zomato_new.png', offer: 'Dining' }
];

export const ottBrands = [
  { name: 'SonyLIV', image: '/assets/brands/ott_sonyliv.png' },
  { name: 'Spotify', image: '/assets/brands/ott_spotify.png' },
  { name: 'Disney+ Hotstar', image: '/assets/brands/ott_hotstar.png' },
  { name: 'Prime Video', image: '/assets/brands/ott_prime.png' }
];

export const policies = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How Wigope Recharge handles customer data, consent, account access and support records.',
    sections: [
      {
        heading: 'Data we collect',
        body: [
          'We collect information required to operate recharge, bill payment, wallet, rewards and support flows, including mobile number, transaction references, device/session details and customer support messages.',
          'Sensitive identity or payment information is collected only where required for a lawful service, compliance workflow or payment gateway requirement.'
        ]
      },
      {
        heading: 'Use of data',
        body: [
          'Customer data is used to authenticate users, process transactions, display receipts, resolve complaints, prevent misuse and improve service reliability.',
          'Wigope does not sell customer personal data. Data may be shared with payment, recharge, rewards, banking, compliance and support partners only for service fulfilment.'
        ]
      }
    ]
  },
  {
    slug: 'terms-conditions',
    title: 'Terms & Conditions',
    summary: 'Customer obligations, acceptable use, recharge rules and platform limitations.',
    sections: [
      {
        heading: 'Platform use',
        body: [
          'Customers must provide accurate mobile, biller, consumer and payment details before submitting a transaction.',
          'A successful payment request does not guarantee operator fulfilment until the provider or biller confirms the final status.'
        ]
      },
      {
        heading: 'Service availability',
        body: [
          'Recharge, bill payment, wallet, rewards and voucher services depend on third-party providers and may be temporarily unavailable because of maintenance, provider downtime or compliance checks.',
          'Wigope may pause, reject or review transactions that appear suspicious, incomplete or inconsistent with platform rules.'
        ]
      }
    ]
  },
  {
    slug: 'refund-cancellation',
    title: 'Refund & Cancellation Policy',
    summary: 'Failed recharge, bill payment and wallet reversal handling.',
    sections: [
      {
        heading: 'Failed transactions',
        body: [
          'If a recharge or bill payment fails after amount deduction, Wigope initiates refund handling as per provider confirmation and transaction status.',
          'Refunds may be credited to wallet or original payment source depending on the payment route and provider settlement status.'
        ]
      },
      {
        heading: 'Customer mistakes',
        body: [
          'Transactions submitted with incorrect mobile number, biller details, account number or consumer ID may not be cancellable once processed by the provider.',
          'Customers should verify all details before confirmation.'
        ]
      }
    ]
  },
  {
    slug: 'grievance-redressal',
    title: 'Grievance Redressal Policy',
    summary: 'Support escalation, complaint tracking and resolution channels.',
    sections: [
      {
        heading: 'Support channels',
        body: [
          'Customers can contact Wigope Recharge support through WhatsApp at +91 9568 654684 or email support@wigope.com.',
          'Support requests should include transaction ID, mobile number used for login and a clear description of the issue.'
        ]
      },
      {
        heading: 'Escalation',
        body: [
          'Complaints are reviewed by support and operations teams. Provider-side issues may require additional time based on the operator, biller or gateway response.',
          'Wigope maintains complaint records for audit, reconciliation and customer resolution.'
        ]
      }
    ]
  },
  {
    slug: 'kyc-compliance',
    title: 'KYC & Compliance Policy',
    summary: 'Customer verification and document handling for regulated or high-risk flows.',
    sections: [
      {
        heading: 'Verification',
        body: [
          'Where required by product, payment partner or law, Wigope may ask customers or merchants for PAN, Aadhaar, business identity, GST or bank proof.',
          'Documents are used only for verification, compliance review, fraud prevention and partner onboarding requirements.'
        ]
      },
      {
        heading: 'Record controls',
        body: [
          'KYC records are protected using role-based access controls and retained only for lawful operational or compliance needs.',
          'Customers must not submit forged, altered or third-party identity documents.'
        ]
      }
    ]
  },
  {
    slug: 'security-policy',
    title: 'Security Policy',
    summary: 'HTTPS, OTP access, session controls and payment security practices.',
    sections: [
      {
        heading: 'Secure access',
        body: [
          'Customer access uses OTP-based authentication and secure sessions. Production APIs are served over HTTPS.',
          'Wigope monitors operational logs, provider responses and transaction states to identify failed, suspicious or abnormal activity.'
        ]
      },
      {
        heading: 'Payment safety',
        body: [
          'Payment processing is handled through authorised payment gateway partners. Wigope does not ask customers to share OTPs, passwords or card PINs with support staff.',
          'Customers should report suspicious messages or payment requests immediately.'
        ]
      }
    ]
  },
  {
    slug: 'aml-cft-policy',
    title: 'AML / CFT Policy',
    summary: 'Misuse prevention, suspicious activity checks and transaction review practices.',
    sections: [
      {
        heading: 'Risk controls',
        body: [
          'Wigope may review, hold, reject or report activity that appears fraudulent, abusive, high-risk or inconsistent with normal customer behaviour.',
          'The platform may apply limits, device checks, transaction monitoring and manual review for security and compliance.'
        ]
      },
      {
        heading: 'Prohibited use',
        body: [
          'Customers must not use Wigope Recharge for illegal transactions, identity misuse, fraudulent recharge patterns, money laundering, sanctioned activity or any prohibited purpose.',
          'Violations may result in account restriction, transaction cancellation and lawful reporting.'
        ]
      }
    ]
  },
  {
    slug: 'cookies-policy',
    title: 'Cookies Policy',
    summary: 'How Wigope Recharge uses essential cookies and similar browser storage for website and session reliability.',
    sections: [
      {
        heading: 'Essential website storage',
        body: [
          'Wigope Recharge may use essential cookies or browser storage to keep the website secure, remember session state, improve page reliability and support authentication flows.',
          'These controls help keep the recharge website functional and do not replace customer consent requirements where optional analytics or marketing tools are introduced.'
        ]
      },
      {
        heading: 'Customer choices',
        body: [
          'Customers may control cookies through their browser settings. Blocking essential storage can affect account access, payment and support experiences.',
          'Any future optional analytics or marketing tracking will be handled with appropriate notice and controls.'
        ]
      }
    ]
  }
];
