// Real responses from api.chargealong.io, captured 30 September 2026 and
// trimmed to two rows per list. Field names exactly as on the wire.

export const COUNTRIES = {
  "data": [
    {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    {
      "iso2": "CA",
      "slug": "canada",
      "name": "Canada",
      "site_count": 16732
    }
  ],
  "generated_at": "2026-09-30T00:24:34Z"
} as const;

export const OVERVIEW = {
  "data": {
    "sites": 132525,
    "ultra_fast": 6964,
    "countries": [
      {
        "iso2": "AU",
        "slug": "australia",
        "name": "Australia",
        "site_count": 5076,
        "busiest": [
          {
            "slug": "randwick",
            "name": "Randwick",
            "postcode": "2031",
            "site_count": 26,
            "region": "new-south-wales"
          },
          {
            "slug": "chatswood",
            "name": "Chatswood",
            "postcode": "2057",
            "site_count": 24,
            "region": "new-south-wales"
          }
        ]
      },
      {
        "iso2": "CA",
        "slug": "canada",
        "name": "Canada",
        "site_count": 16732,
        "busiest": [
          {
            "slug": "magog",
            "name": "Magog",
            "postcode": "J1X",
            "site_count": 55,
            "region": "quebec"
          },
          {
            "slug": "saint-hyacinthe",
            "name": "Saint-Hyacinthe",
            "site_count": 50,
            "region": "quebec"
          }
        ]
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:34Z"
} as const;

export const COUNTRY = {
  "data": {
    "country": {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    "regions": [
      {
        "slug": "australian-capital-territory",
        "code": "ACT",
        "name": "Australian Capital Territory",
        "site_count": 84
      },
      {
        "slug": "new-south-wales",
        "code": "NSW",
        "name": "New South Wales",
        "site_count": 2833
      }
    ],
    "busiest": [
      {
        "slug": "randwick",
        "name": "Randwick",
        "postcode": "2031",
        "site_count": 26,
        "region": "new-south-wales"
      },
      {
        "slug": "chatswood",
        "name": "Chatswood",
        "postcode": "2057",
        "site_count": 24,
        "region": "new-south-wales"
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:43Z"
} as const;

export const REGION = {
  "data": {
    "country": {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    "region": {
      "slug": "victoria",
      "code": "VIC",
      "name": "Victoria",
      "site_count": 718
    },
    "localities": [
      {
        "slug": "abbotsford",
        "name": "Abbotsford",
        "postcode": "3067",
        "site_count": 1
      },
      {
        "slug": "aireys-inlet",
        "name": "Aireys Inlet",
        "postcode": "3231",
        "site_count": 1
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:44Z"
} as const;

export const NETWORKS = {
  "data": {
    "country": {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    "networks": [
      {
        "key": "unbranded",
        "name": "",
        "site_count": 2851,
        "region_count": 8
      },
      {
        "key": "chargefox",
        "name": "Chargefox",
        "site_count": 509,
        "region_count": 7
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:44Z"
} as const;

export const NETWORK = {
  "data": {
    "country": {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    "network": {
      "key": "chargefox",
      "name": "Chargefox",
      "site_count": 509,
      "region_count": 7
    },
    "regions": [
      {
        "slug": "new-south-wales",
        "code": "NSW",
        "name": "New South Wales",
        "site_count": 256
      },
      {
        "slug": "victoria",
        "code": "VIC",
        "name": "Victoria",
        "site_count": 93
      }
    ],
    "busiest": [
      {
        "slug": "ben-buckler",
        "name": "Ben Buckler",
        "postcode": "2026",
        "site_count": 7,
        "region": "new-south-wales"
      },
      {
        "slug": "bondi",
        "name": "Bondi",
        "postcode": "2026",
        "site_count": 6,
        "region": "new-south-wales"
      }
    ],
    "sites": [
      {
        "public_id": "gnhcbx24",
        "name": "Chargefox Airport West",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "29-35 Louis St, Airport West Victoria 3042",
        "status": "active",
        "speed": "ultra-fast",
        "max_kw": 350,
        "plugs": 8,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "paid",
        "lat": -37.71364567547256,
        "lng": 144.88569078594128,
        "path": "/en/australia/victoria/gowanbrae/chargefox/chargefox-airport-west-gnhcbx24/"
      },
      {
        "public_id": "23bnx42r",
        "name": "Chargefox - Barnawartha North",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "Murray Valley Hwy, Barnawartha North Vic 3690",
        "status": "active",
        "speed": "ultra-fast",
        "max_kw": 350,
        "plugs": 8,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "paid",
        "lat": -36.0741629913788,
        "lng": 146.72714760942472,
        "path": "/en/australia/victoria/barnawartha/chargefox/chargefox-barnawartha-north-23bnx42r/"
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:44Z"
} as const;

export const LOCALITY = {
  "data": {
    "country": {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    "region": {
      "slug": "victoria",
      "code": "VIC",
      "name": "Victoria",
      "site_count": 718
    },
    "locality": {
      "slug": "coburg",
      "name": "Coburg",
      "postcode": "3058",
      "time_zone": "Australia/Melbourne",
      "site_count": 0
    },
    "sites": [],
    "facets": [],
    "neighbours": [
      {
        "region": "victoria",
        "slug": "batman",
        "name": "Batman",
        "site_count": 2,
        "distance_km": 1.2107007134999999
      },
      {
        "region": "victoria",
        "slug": "brunswick",
        "name": "Brunswick",
        "site_count": 2,
        "distance_km": 1.8502351159
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:44Z"
} as const;

export const SITE = {
  "data": {
    "country": {
      "iso2": "AU",
      "slug": "australia",
      "name": "Australia",
      "site_count": 5076
    },
    "region": {
      "slug": "victoria",
      "code": "VIC",
      "name": "Victoria",
      "site_count": 718
    },
    "locality": {
      "slug": "batman",
      "name": "Batman",
      "postcode": "3058",
      "time_zone": "Australia/Melbourne",
      "site_count": 2
    },
    "site": {
      "public_id": "hwqb4abf",
      "name": "Coburg Town Hall / Moreland City",
      "network": "chargefox",
      "network_name": "Chargefox",
      "address": "Bell Street, Coburg, Melbourne Victoria 3058",
      "status": "active",
      "speed": "ac",
      "max_kw": 7,
      "plugs": 2,
      "standards": [
        "type-2"
      ],
      "cost_kind": "free",
      "lat": -37.74066654517114,
      "lng": 144.96967301950258,
      "path": "/en/australia/victoria/batman/chargefox/coburg-town-hall-moreland-city-hwqb4abf/",
      "operator": "Chargefox",
      "usage": "public",
      "cost": {
        "kind": "free",
        "has_conditions": false,
        "text": "Free"
      },
      "last_verified_at": "2023-07-13T09:29:00Z",
      "updated_at": "2026-09-13T06:30:14.710491Z"
    },
    "connectors": [
      {
        "standard": "type-2",
        "label": "Type 2 (Socket Only)",
        "current": "ac",
        "power_kw": 7,
        "quantity": 2
      }
    ],
    "sources": [
      {
        "key": "ocm",
        "external_id": "210937",
        "provider": "Open Charge Map Contributors",
        "licence": "Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)",
        "last_seen_at": "2026-09-27T16:30:15.042312Z"
      }
    ],
    "alternatives": [
      {
        "public_id": "guzgfbyv",
        "name": "Coburg Civic Centre / Moreland City",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "90 Bell Street, Coburg Victoria 3058",
        "status": "active",
        "speed": "fast",
        "max_kw": 50,
        "plugs": 3,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "free",
        "lat": -37.74104152020631,
        "lng": 144.9701497464091,
        "path": "/en/australia/victoria/batman/chargefox/coburg-civic-centre-moreland-city-guzgfbyv/",
        "distance_km": 0.05914173373
      },
      {
        "public_id": "ebmatp2u",
        "name": "Coburg Hill Shopping Centre – Coburg North",
        "network": "evie-networks",
        "network_name": "Evie Networks",
        "address": "153-157 Elizabeth Street, Coburg North VIC 3058",
        "status": "active",
        "speed": "fast",
        "max_kw": 75,
        "plugs": 4,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "paid",
        "lat": -37.7296495,
        "lng": 144.9836438,
        "path": "/en/australia/victoria/coburg-north/evie-networks/coburg-hill-shopping-centre-coburg-north-ebmatp2u/",
        "distance_km": 1.73545310133
      }
    ],
    "faster": {
      "public_id": "guzgfbyv",
      "name": "Coburg Civic Centre / Moreland City",
      "network": "chargefox",
      "network_name": "Chargefox",
      "address": "90 Bell Street, Coburg Victoria 3058",
      "status": "active",
      "speed": "fast",
      "max_kw": 50,
      "plugs": 3,
      "standards": [
        "ccs2",
        "chademo"
      ],
      "cost_kind": "free",
      "lat": -37.74104152020631,
      "lng": 144.9701497464091,
      "path": "/en/australia/victoria/batman/chargefox/coburg-civic-centre-moreland-city-guzgfbyv/",
      "distance_km": 0.05914173373
    },
    "reviews": {
      "summary": {
        "count": 0,
        "average": null,
        "last_worked_at": null,
        "last_checked_at": null
      },
      "recent": []
    },
    "photos": []
  },
  "generated_at": "2026-09-30T00:24:43Z"
} as const;

export const SEARCH = {
  "data": {
    "localities": [
      {
        "country_iso2": "US",
        "country_name": "United States",
        "region_code": "OR",
        "region_name": "Oregon",
        "slug": "coburg",
        "name": "Coburg",
        "site_count": 8,
        "path": "/en/united-states/oregon/coburg/",
        "exact": true,
        "lat": 44.13707,
        "lng": -123.06648
      },
      {
        "country_iso2": "AU",
        "country_name": "Australia",
        "region_code": "VIC",
        "region_name": "Victoria",
        "slug": "coburg",
        "name": "Coburg",
        "postcode": "3058",
        "site_count": 0,
        "path": "/en/australia/victoria/coburg/",
        "exact": true,
        "lat": -37.75,
        "lng": 144.96667
      }
    ],
    "postcodes": [],
    "sites": [
      {
        "public_id": "m6mnomea",
        "name": "Coburg North EV Fast Charge",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "11 Boundary Road, Coburg North Victoria 3058",
        "status": "active",
        "speed": "fast",
        "max_kw": 50,
        "plugs": 2,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "free",
        "lat": -37.71893760420672,
        "lng": 144.9615007076203,
        "path": "/en/australia/victoria/fawkner/chargefox/coburg-north-ev-fast-charge-m6mnomea/"
      },
      {
        "public_id": "guzgfbyv",
        "name": "Coburg Civic Centre / Moreland City",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "90 Bell Street, Coburg Victoria 3058",
        "status": "active",
        "speed": "fast",
        "max_kw": 50,
        "plugs": 3,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "free",
        "lat": -37.74104152020631,
        "lng": 144.9701497464091,
        "path": "/en/australia/victoria/batman/chargefox/coburg-civic-centre-moreland-city-guzgfbyv/"
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:34Z"
} as const;

export const NEARBY = {
  "data": {
    "near": {
      "country_iso2": "AU",
      "name": "Merlynston",
      "region_code": "VIC",
      "region_name": "Victoria",
      "path": "/en/australia/victoria/merlynston/",
      "distance_km": 0.13679526359
    },
    "sites": [
      {
        "public_id": "hwqb4abf",
        "name": "Coburg Town Hall / Moreland City",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "Bell Street, Coburg, Melbourne Victoria 3058",
        "status": "active",
        "speed": "ac",
        "max_kw": 7,
        "plugs": 2,
        "standards": [
          "type-2"
        ],
        "cost_kind": "free",
        "lat": -37.74066654517114,
        "lng": 144.96967301950258,
        "path": "/en/australia/victoria/batman/chargefox/coburg-town-hall-moreland-city-hwqb4abf/",
        "distance_km": 0.5625029574599999
      },
      {
        "public_id": "guzgfbyv",
        "name": "Coburg Civic Centre / Moreland City",
        "network": "chargefox",
        "network_name": "Chargefox",
        "address": "90 Bell Street, Coburg Victoria 3058",
        "status": "active",
        "speed": "fast",
        "max_kw": 50,
        "plugs": 3,
        "standards": [
          "ccs2",
          "chademo"
        ],
        "cost_kind": "free",
        "lat": -37.74104152020631,
        "lng": 144.9701497464091,
        "path": "/en/australia/victoria/batman/chargefox/coburg-civic-centre-moreland-city-guzgfbyv/",
        "distance_km": 0.60792635786
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:35Z"
} as const;

export const TRIP = {
  "data": {
    "route": {
      "distance_km": 862.03,
      "duration_min": 490,
      "line": [
        [
          144.962979,
          -37.814006
        ],
        [
          144.956905,
          -37.801583
        ],
        [
          144.96013,
          -37.77751
        ]
      ]
    },
    "feasible": true,
    "arrival_pct": 20,
    "drive_min": 491,
    "charge_min": 44,
    "total_min": 535,
    "stops": [
      {
        "site": {
          "public_id": "xyjobdss",
          "name": "7-Eleven – Wodonga West",
          "network": "evie-networks",
          "network_name": "Evie Networks",
          "operator": "Evie Networks",
          "address": "196 Melbourne Rd, Wodonga VIC 3690",
          "status": "active",
          "lat": -36.1112619,
          "lng": 146.8641004,
          "path": "/en/australia/victoria/west-wodonga/evie-networks/7-eleven-wodonga-west-xyjobdss/"
        },
        "along_km": 299.4,
        "detour_km": 1,
        "power_kw": 150,
        "dc": true,
        "arrive_pct": 25,
        "depart_pct": 71,
        "energy_kwh": 31.3,
        "charge_min": 15
      },
      {
        "site": {
          "public_id": "ruq4nfbv",
          "name": "Beehive Hotel Motel",
          "network": "unbranded",
          "address": "479 Coolac Rd, Coolac NSW 2727",
          "status": "active",
          "lat": -34.92370530370222,
          "lng": 148.1656922603388,
          "path": "/en/australia/new-south-wales/coolac/unbranded/beehive-hotel-motel-ruq4nfbv/"
        },
        "along_km": 498.3,
        "detour_km": 1.3,
        "power_kw": 150,
        "dc": true,
        "arrive_pct": 20,
        "depart_pct": 76,
        "energy_kwh": 38.1,
        "charge_min": 19
      }
    ]
  },
  "generated_at": "2026-09-30T00:24:52Z"
} as const;

export const VEHICLES = {
  "data": [
    {
      "slug": "tesla-model-3",
      "brand": "Tesla",
      "model": "Model 3",
      "year": 2023,
      "source_id": "fbffc80f-062d-ed16-d6df-5f621bb35848",
      "battery_kwh": 57.5,
      "consumption_kwh_100km": 13.7,
      "range_km": 419,
      "ac_kw": 11,
      "ac_ports": [
        "type-2"
      ],
      "dc_kw": 57.5,
      "dc_ports": [
        "ccs2"
      ],
      "curve": [
        {
          "pct": 0,
          "power_kw": 57.5
        },
        {
          "pct": 50,
          "power_kw": 57.5
        }
      ],
      "voltage_v": 400
    },
    {
      "slug": "tesla-model-3-lr",
      "brand": "Tesla",
      "model": "Model 3",
      "variant": "LR",
      "year": 2020,
      "source_id": "7de25a64-e9fa-484f-bf99-d02b02cfb17d",
      "battery_kwh": 74,
      "consumption_kwh_100km": 16.1,
      "range_km": 459,
      "ac_kw": 11,
      "ac_ports": [
        "type-2"
      ],
      "dc_kw": 195,
      "dc_ports": [
        "ccs2"
      ],
      "curve": [
        {
          "pct": 0,
          "power_kw": 180
        },
        {
          "pct": 40,
          "power_kw": 195
        }
      ],
      "voltage_v": 400
    }
  ],
  "source": {
    "licence": "MIT",
    "name": "Open EV Data",
    "url": "https://github.com/KilowattApp/open-ev-data"
  },
  "generated_at": "2026-09-30T00:24:35Z"
} as const;

export const VEHICLE = {
  "data": {
    "slug": "tesla-model-3",
    "brand": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "source_id": "fbffc80f-062d-ed16-d6df-5f621bb35848",
    "battery_kwh": 57.5,
    "consumption_kwh_100km": 13.7,
    "range_km": 419,
    "ac_kw": 11,
    "ac_ports": [
      "type-2"
    ],
    "dc_kw": 57.5,
    "dc_ports": [
      "ccs2"
    ],
    "curve": [
      {
        "pct": 0,
        "power_kw": 57.5
      },
      {
        "pct": 50,
        "power_kw": 57.5
      }
    ],
    "voltage_v": 400,
    "charging": [
      {
        "charger_kw": 50,
        "minutes_10_80": 55
      },
      {
        "charger_kw": 150,
        "minutes_10_80": 51
      }
    ]
  },
  "source": {
    "licence": "MIT",
    "name": "Open EV Data",
    "url": "https://github.com/KilowattApp/open-ev-data"
  },
  "generated_at": "2026-09-30T00:24:44Z"
} as const;

export const NOTFOUND = {
  "status": 404,
  "title": "not found",
  "type": "about:blank"
} as const;

export const BADNEARBY = {
  "detail": "lat: must be between -90 and 90",
  "status": 400,
  "title": "invalid nearby request",
  "type": "about:blank"
} as const;
