import { useState, useEffect } from "react";
import type { ApiResult } from "../lib/types";


const mockRequest = (): Promise<{items: ApiResult[]}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        "items": [
            {
                "id": 4399,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/dec2a0e2-c451-4af6-acbf-c29062b5f593.webp",
                "rating": "safe",
                "color_dominant": [
                    75,
                    52,
                    122
                ],
                "color_palette": [
                    [
                        220,
                        190,
                        229
                    ],
                    [
                        60,
                        40,
                        105
                    ],
                    [
                        21,
                        13,
                        39
                    ],
                    [
                        139,
                        101,
                        158
                    ],
                    [
                        122,
                        79,
                        217
                    ],
                    [
                        81,
                        54,
                        168
                    ],
                    [
                        187,
                        72,
                        220
                    ],
                    [
                        163,
                        156,
                        170
                    ],
                    [
                        113,
                        101,
                        146
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "weapon",
                    "sword",
                    "girl"
                ],
                "source_url": null
            },
            {
                "id": 4411,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/2e0d15b8-6a5b-4662-a9b1-c84a158ac399.webp",
                "rating": "safe",
                "color_dominant": [
                    152,
                    135,
                    143
                ],
                "color_palette": [
                    [
                        142,
                        123,
                        137
                    ],
                    [
                        221,
                        225,
                        224
                    ],
                    [
                        59,
                        52,
                        63
                    ],
                    [
                        118,
                        63,
                        83
                    ],
                    [
                        175,
                        178,
                        174
                    ],
                    [
                        217,
                        178,
                        167
                    ],
                    [
                        103,
                        83,
                        95
                    ],
                    [
                        187,
                        190,
                        206
                    ],
                    [
                        97,
                        80,
                        65
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "reading",
                    "girl",
                    "black_hair"
                ],
                "source_url": null
            },
            {
                "id": 40067,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/b4c13422-1907-4608-8d5f-bd53e75245f4.webp",
                "rating": "safe",
                "color_dominant": [
                    244,
                    208,
                    101
                ],
                "color_palette": [
                    [
                        193,
                        73,
                        52
                    ],
                    [
                        249,
                        217,
                        92
                    ],
                    [
                        85,
                        56,
                        43
                    ],
                    [
                        245,
                        234,
                        228
                    ],
                    [
                        212,
                        128,
                        95
                    ],
                    [
                        230,
                        192,
                        154
                    ],
                    [
                        214,
                        143,
                        21
                    ],
                    [
                        174,
                        176,
                        147
                    ],
                    [
                        116,
                        132,
                        108
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "skirt",
                    "red_hair",
                    "exposed_girl_breasts",
                    "girl",
                    "medium_breasts"
                ],
                "source_url": null
            },
            {
                "id": 4418,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/c130eb8c-a8a2-46c0-ad66-446f5200181c.webp",
                "rating": "safe",
                "color_dominant": [
                    226,
                    178,
                    176
                ],
                "color_palette": [
                    [
                        236,
                        196,
                        203
                    ],
                    [
                        95,
                        43,
                        47
                    ],
                    [
                        155,
                        101,
                        50
                    ],
                    [
                        104,
                        78,
                        76
                    ],
                    [
                        178,
                        93,
                        108
                    ],
                    [
                        204,
                        149,
                        94
                    ],
                    [
                        208,
                        129,
                        150
                    ],
                    [
                        166,
                        157,
                        155
                    ],
                    [
                        241,
                        60,
                        132
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "pink_hair",
                    "flowers",
                    "girl"
                ],
                "source_url": null
            },
            {
                "id": 29813,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/241b4dc3-8f02-49ee-937f-ac281cdfffdf.webp",
                "rating": "safe",
                "color_dominant": [
                    78,
                    127,
                    142
                ],
                "color_palette": [
                    [
                        236,
                        232,
                        233
                    ],
                    [
                        55,
                        107,
                        125
                    ],
                    [
                        126,
                        204,
                        213
                    ],
                    [
                        29,
                        35,
                        42
                    ],
                    [
                        153,
                        147,
                        153
                    ],
                    [
                        79,
                        165,
                        180
                    ],
                    [
                        108,
                        184,
                        207
                    ],
                    [
                        21,
                        51,
                        69
                    ],
                    [
                        200,
                        91,
                        85
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "wet",
                    "girl"
                ],
                "source_url": null
            },
            {
                "id": 253,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/5004a559-b8b5-4539-a3ce-755bc5b3f6f5.webp",
                "rating": "safe",
                "color_dominant": [
                    238,
                    225,
                    213
                ],
                "color_palette": [
                    [
                        159,
                        90,
                        66
                    ],
                    [
                        122,
                        43,
                        42
                    ],
                    [
                        243,
                        235,
                        226
                    ],
                    [
                        176,
                        120,
                        117
                    ],
                    [
                        214,
                        170,
                        137
                    ],
                    [
                        214,
                        175,
                        169
                    ],
                    [
                        112,
                        103,
                        104
                    ],
                    [
                        176,
                        167,
                        168
                    ],
                    [
                        188,
                        60,
                        148
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "brown_hair",
                    "catgirl",
                    "girl",
                    "kemonomimi"
                ],
                "source_url": null
            },
            {
                "id": 256,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/a6497c6d-f782-457d-a6f7-001e642a99e9.webp",
                "rating": "safe",
                "color_dominant": [
                    64,
                    59,
                    83
                ],
                "color_palette": [
                    [
                        225,
                        208,
                        202
                    ],
                    [
                        62,
                        56,
                        80
                    ],
                    [
                        132,
                        108,
                        129
                    ],
                    [
                        126,
                        206,
                        199
                    ],
                    [
                        90,
                        100,
                        135
                    ],
                    [
                        186,
                        84,
                        112
                    ],
                    [
                        150,
                        142,
                        174
                    ],
                    [
                        93,
                        110,
                        113
                    ],
                    [
                        27,
                        19,
                        26
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "weapon",
                    "girl",
                    "black_hair"
                ],
                "source_url": null
            },
            {
                "id": 261,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/22643402-7c45-4819-ab77-70adaee4243d.webp",
                "rating": "safe",
                "color_dominant": [
                    197,
                    151,
                    144
                ],
                "color_palette": [
                    [
                        207,
                        162,
                        150
                    ],
                    [
                        120,
                        58,
                        76
                    ],
                    [
                        58,
                        27,
                        32
                    ],
                    [
                        247,
                        231,
                        221
                    ],
                    [
                        133,
                        80,
                        64
                    ],
                    [
                        124,
                        93,
                        128
                    ],
                    [
                        167,
                        95,
                        90
                    ],
                    [
                        216,
                        184,
                        225
                    ],
                    [
                        74,
                        159,
                        141
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "school_uniform",
                    "brown_hair",
                    "girl"
                ],
                "source_url": null
            },
            {
                "id": 264,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/3a7264d3-d645-4cbd-9132-0c4c63fa4cc5.webp",
                "rating": "safe",
                "color_dominant": [
                    222,
                    196,
                    147
                ],
                "color_palette": [
                    [
                        222,
                        197,
                        148
                    ],
                    [
                        27,
                        28,
                        18
                    ],
                    [
                        147,
                        125,
                        76
                    ],
                    [
                        165,
                        153,
                        97
                    ],
                    [
                        92,
                        93,
                        65
                    ],
                    [
                        78,
                        69,
                        41
                    ],
                    [
                        195,
                        42,
                        12
                    ],
                    [
                        148,
                        140,
                        140
                    ],
                    [
                        88,
                        84,
                        84
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "skirt",
                    "tree",
                    "girl",
                    "black_hair"
                ],
                "source_url": null
            },
            {
                "id": 276,
                "url": "https://s3.nyeki.dev/nekos-api/images/original/b739e8ca-f9cb-4432-9c16-94ea537f69cb.webp",
                "rating": "safe",
                "color_dominant": [
                    162,
                    80,
                    94
                ],
                "color_palette": [
                    [
                        171,
                        71,
                        85
                    ],
                    [
                        234,
                        223,
                        221
                    ],
                    [
                        52,
                        48,
                        59
                    ],
                    [
                        160,
                        148,
                        159
                    ],
                    [
                        172,
                        167,
                        182
                    ],
                    [
                        97,
                        61,
                        71
                    ],
                    [
                        220,
                        121,
                        140
                    ],
                    [
                        164,
                        117,
                        136
                    ],
                    [
                        76,
                        92,
                        100
                    ]
                ],
                "artist_name": null,
                "tags": [
                    "red_hair",
                    "shorts"
                ],
                "source_url": null
            }
        ],
    })
    console.log("timeout ended")
    }, 2000);
  })
}

export const useFetch = (url: string) => {
  const [data, setData] = useState<ApiResult[] | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setIsPending(true);
      try {
        // const response = await fetch(url, {method: 'GET'});
        // if (!response.ok) throw new Error(response.statusText);
        // const json = await response.json();
        const response = await mockRequest()
        setIsPending(false);
        // setData(json);
        setData(response.items)
        setError(null);
      } catch (error) {
        setError(`${error} Could not Fetch Data`);
        setIsPending(false);
      }
    };
    fetchData();
  }, [url]);
  return { data, isPending, error };
};