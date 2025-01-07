import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  plugins: [],
  theme: {
    extend: {
      // Tetris board size is currently capped to 1280x720
      // This size already leads to 214 x 120 = 25680 cells
      // At this moment i don't want to make it more performance heavy
      gridTemplateColumns: {
        "13": "repeat(13, minmax(0, 1fr))",
        "14": "repeat(14, minmax(0, 1fr))",
        "15": "repeat(15, minmax(0, 1fr))",
        "16": "repeat(16, minmax(0, 1fr))",
        "17": "repeat(17, minmax(0, 1fr))",
        "18": "repeat(18, minmax(0, 1fr))",
        "19": "repeat(19, minmax(0, 1fr))",
        "20": "repeat(20, minmax(0, 1fr))",
        "21": "repeat(21, minmax(0, 1fr))",
        "22": "repeat(22, minmax(0, 1fr))",
        "23": "repeat(23, minmax(0, 1fr))",
        "24": "repeat(24, minmax(0, 1fr))",
        "25": "repeat(25, minmax(0, 1fr))",
        "26": "repeat(26, minmax(0, 1fr))",
        "27": "repeat(27, minmax(0, 1fr))",
        "28": "repeat(28, minmax(0, 1fr))",
        "29": "repeat(29, minmax(0, 1fr))",
        "30": "repeat(30, minmax(0, 1fr))",
        "31": "repeat(31, minmax(0, 1fr))",
        "32": "repeat(32, minmax(0, 1fr))",
        "33": "repeat(33, minmax(0, 1fr))",
        "34": "repeat(34, minmax(0, 1fr))",
        "35": "repeat(35, minmax(0, 1fr))",
        "36": "repeat(36, minmax(0, 1fr))",
        "37": "repeat(37, minmax(0, 1fr))",
        "38": "repeat(38, minmax(0, 1fr))",
        "39": "repeat(39, minmax(0, 1fr))",
        "40": "repeat(40, minmax(0, 1fr))",
        "41": "repeat(41, minmax(0, 1fr))",
        "42": "repeat(42, minmax(0, 1fr))",
        "43": "repeat(43, minmax(0, 1fr))",
        "44": "repeat(44, minmax(0, 1fr))",
        "45": "repeat(45, minmax(0, 1fr))",
        "46": "repeat(46, minmax(0, 1fr))",
        "47": "repeat(47, minmax(0, 1fr))",
        "48": "repeat(48, minmax(0, 1fr))",
        "49": "repeat(49, minmax(0, 1fr))",
        "50": "repeat(50, minmax(0, 1fr))",
        "51": "repeat(51, minmax(0, 1fr))",
        "52": "repeat(52, minmax(0, 1fr))",
        "53": "repeat(53, minmax(0, 1fr))",
        "54": "repeat(54, minmax(0, 1fr))",
        "55": "repeat(55, minmax(0, 1fr))",
        "56": "repeat(56, minmax(0, 1fr))",
        "57": "repeat(57, minmax(0, 1fr))",
        "58": "repeat(58, minmax(0, 1fr))",
        "59": "repeat(59, minmax(0, 1fr))",
        "60": "repeat(60, minmax(0, 1fr))",
        "61": "repeat(61, minmax(0, 1fr))",
        "62": "repeat(62, minmax(0, 1fr))",
        "63": "repeat(63, minmax(0, 1fr))",
        "64": "repeat(64, minmax(0, 1fr))",
        "65": "repeat(65, minmax(0, 1fr))",
        "66": "repeat(66, minmax(0, 1fr))",
        "67": "repeat(67, minmax(0, 1fr))",
        "68": "repeat(68, minmax(0, 1fr))",
        "69": "repeat(69, minmax(0, 1fr))",
        "70": "repeat(70, minmax(0, 1fr))",
        "71": "repeat(71, minmax(0, 1fr))",
        "72": "repeat(72, minmax(0, 1fr))",
        "73": "repeat(73, minmax(0, 1fr))",
        "74": "repeat(74, minmax(0, 1fr))",
        "75": "repeat(75, minmax(0, 1fr))",
        "76": "repeat(76, minmax(0, 1fr))",
        "77": "repeat(77, minmax(0, 1fr))",
        "78": "repeat(78, minmax(0, 1fr))",
        "79": "repeat(79, minmax(0, 1fr))",
        "80": "repeat(80, minmax(0, 1fr))",
        "81": "repeat(81, minmax(0, 1fr))",
        "82": "repeat(82, minmax(0, 1fr))",
        "83": "repeat(83, minmax(0, 1fr))",
        "84": "repeat(84, minmax(0, 1fr))",
        "85": "repeat(85, minmax(0, 1fr))",
        "86": "repeat(86, minmax(0, 1fr))",
        "87": "repeat(87, minmax(0, 1fr))",
        "88": "repeat(88, minmax(0, 1fr))",
        "89": "repeat(89, minmax(0, 1fr))",
        "90": "repeat(90, minmax(0, 1fr))",
        "91": "repeat(91, minmax(0, 1fr))",
        "92": "repeat(92, minmax(0, 1fr))",
        "93": "repeat(93, minmax(0, 1fr))",
        "94": "repeat(94, minmax(0, 1fr))",
        "95": "repeat(95, minmax(0, 1fr))",
        "96": "repeat(96, minmax(0, 1fr))",
        "97": "repeat(97, minmax(0, 1fr))",
        "98": "repeat(98, minmax(0, 1fr))",
        "99": "repeat(99, minmax(0, 1fr))",
        "100": "repeat(100, minmax(0, 1fr))",
        "101": "repeat(101, minmax(0, 1fr))",
        "102": "repeat(102, minmax(0, 1fr))",
        "103": "repeat(103, minmax(0, 1fr))",
        "104": "repeat(104, minmax(0, 1fr))",
        "105": "repeat(105, minmax(0, 1fr))",
        "106": "repeat(106, minmax(0, 1fr))",
        "107": "repeat(107, minmax(0, 1fr))",
        "108": "repeat(108, minmax(0, 1fr))",
        "109": "repeat(109, minmax(0, 1fr))",
        "110": "repeat(110, minmax(0, 1fr))",
        "111": "repeat(111, minmax(0, 1fr))",
        "112": "repeat(112, minmax(0, 1fr))",
        "113": "repeat(113, minmax(0, 1fr))",
        "114": "repeat(114, minmax(0, 1fr))",
        "115": "repeat(115, minmax(0, 1fr))",
        "116": "repeat(116, minmax(0, 1fr))",
        "117": "repeat(117, minmax(0, 1fr))",
        "118": "repeat(118, minmax(0, 1fr))",
        "119": "repeat(119, minmax(0, 1fr))",
        "120": "repeat(120, minmax(0, 1fr))",
        "121": "repeat(121, minmax(0, 1fr))",
        "122": "repeat(122, minmax(0, 1fr))",
        "123": "repeat(123, minmax(0, 1fr))",
        "124": "repeat(124, minmax(0, 1fr))",
        "125": "repeat(125, minmax(0, 1fr))",
        "126": "repeat(126, minmax(0, 1fr))",
        "127": "repeat(127, minmax(0, 1fr))",
        "128": "repeat(128, minmax(0, 1fr))",
        "129": "repeat(129, minmax(0, 1fr))",
        "130": "repeat(130, minmax(0, 1fr))",
        "131": "repeat(131, minmax(0, 1fr))",
        "132": "repeat(132, minmax(0, 1fr))",
        "133": "repeat(133, minmax(0, 1fr))",
        "134": "repeat(134, minmax(0, 1fr))",
        "135": "repeat(135, minmax(0, 1fr))",
        "136": "repeat(136, minmax(0, 1fr))",
        "137": "repeat(137, minmax(0, 1fr))",
        "138": "repeat(138, minmax(0, 1fr))",
        "139": "repeat(139, minmax(0, 1fr))",
        "140": "repeat(140, minmax(0, 1fr))",
        "141": "repeat(141, minmax(0, 1fr))",
        "142": "repeat(142, minmax(0, 1fr))",
        "143": "repeat(143, minmax(0, 1fr))",
        "144": "repeat(144, minmax(0, 1fr))",
        "145": "repeat(145, minmax(0, 1fr))",
        "146": "repeat(146, minmax(0, 1fr))",
        "147": "repeat(147, minmax(0, 1fr))",
        "148": "repeat(148, minmax(0, 1fr))",
        "149": "repeat(149, minmax(0, 1fr))",
        "150": "repeat(150, minmax(0, 1fr))",
        "151": "repeat(151, minmax(0, 1fr))",
        "152": "repeat(152, minmax(0, 1fr))",
        "153": "repeat(153, minmax(0, 1fr))",
        "154": "repeat(154, minmax(0, 1fr))",
        "155": "repeat(155, minmax(0, 1fr))",
        "156": "repeat(156, minmax(0, 1fr))",
        "157": "repeat(157, minmax(0, 1fr))",
        "158": "repeat(158, minmax(0, 1fr))",
        "159": "repeat(159, minmax(0, 1fr))",
        "160": "repeat(160, minmax(0, 1fr))",
        "161": "repeat(161, minmax(0, 1fr))",
        "162": "repeat(162, minmax(0, 1fr))",
        "163": "repeat(163, minmax(0, 1fr))",
        "164": "repeat(164, minmax(0, 1fr))",
        "165": "repeat(165, minmax(0, 1fr))",
        "166": "repeat(166, minmax(0, 1fr))",
        "167": "repeat(167, minmax(0, 1fr))",
        "168": "repeat(168, minmax(0, 1fr))",
        "169": "repeat(169, minmax(0, 1fr))",
        "170": "repeat(170, minmax(0, 1fr))",
        "171": "repeat(171, minmax(0, 1fr))",
        "172": "repeat(172, minmax(0, 1fr))",
        "173": "repeat(173, minmax(0, 1fr))",
        "174": "repeat(174, minmax(0, 1fr))",
        "175": "repeat(175, minmax(0, 1fr))",
        "176": "repeat(176, minmax(0, 1fr))",
        "177": "repeat(177, minmax(0, 1fr))",
        "178": "repeat(178, minmax(0, 1fr))",
        "179": "repeat(179, minmax(0, 1fr))",
        "180": "repeat(180, minmax(0, 1fr))",
        "181": "repeat(181, minmax(0, 1fr))",
        "182": "repeat(182, minmax(0, 1fr))",
        "183": "repeat(183, minmax(0, 1fr))",
        "184": "repeat(184, minmax(0, 1fr))",
        "185": "repeat(185, minmax(0, 1fr))",
        "186": "repeat(186, minmax(0, 1fr))",
        "187": "repeat(187, minmax(0, 1fr))",
        "188": "repeat(188, minmax(0, 1fr))",
        "189": "repeat(189, minmax(0, 1fr))",
        "190": "repeat(190, minmax(0, 1fr))",
        "191": "repeat(191, minmax(0, 1fr))",
        "192": "repeat(192, minmax(0, 1fr))",
        "193": "repeat(193, minmax(0, 1fr))",
        "194": "repeat(194, minmax(0, 1fr))",
        "195": "repeat(195, minmax(0, 1fr))",
        "196": "repeat(196, minmax(0, 1fr))",
        "197": "repeat(197, minmax(0, 1fr))",
        "198": "repeat(198, minmax(0, 1fr))",
        "199": "repeat(199, minmax(0, 1fr))",
        "200": "repeat(200, minmax(0, 1fr))",
        "201": "repeat(201, minmax(0, 1fr))",
        "202": "repeat(202, minmax(0, 1fr))",
        "203": "repeat(203, minmax(0, 1fr))",
        "204": "repeat(204, minmax(0, 1fr))",
        "205": "repeat(205, minmax(0, 1fr))",
        "206": "repeat(206, minmax(0, 1fr))",
        "207": "repeat(207, minmax(0, 1fr))",
        "208": "repeat(208, minmax(0, 1fr))",
        "209": "repeat(209, minmax(0, 1fr))",
        "210": "repeat(210, minmax(0, 1fr))",
        "211": "repeat(211, minmax(0, 1fr))",
        "212": "repeat(212, minmax(0, 1fr))",
        "213": "repeat(213, minmax(0, 1fr))",
        "214": "repeat(214, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        "13": "repeat(13, minmax(0, 1fr))",
        "14": "repeat(14, minmax(0, 1fr))",
        "15": "repeat(15, minmax(0, 1fr))",
        "16": "repeat(16, minmax(0, 1fr))",
        "17": "repeat(17, minmax(0, 1fr))",
        "18": "repeat(18, minmax(0, 1fr))",
        "19": "repeat(19, minmax(0, 1fr))",
        "20": "repeat(20, minmax(0, 1fr))",
        "21": "repeat(21, minmax(0, 1fr))",
        "22": "repeat(22, minmax(0, 1fr))",
        "23": "repeat(23, minmax(0, 1fr))",
        "24": "repeat(24, minmax(0, 1fr))",
        "25": "repeat(25, minmax(0, 1fr))",
        "26": "repeat(26, minmax(0, 1fr))",
        "27": "repeat(27, minmax(0, 1fr))",
        "28": "repeat(28, minmax(0, 1fr))",
        "29": "repeat(29, minmax(0, 1fr))",
        "30": "repeat(30, minmax(0, 1fr))",
        "31": "repeat(31, minmax(0, 1fr))",
        "32": "repeat(32, minmax(0, 1fr))",
        "33": "repeat(33, minmax(0, 1fr))",
        "34": "repeat(34, minmax(0, 1fr))",
        "35": "repeat(35, minmax(0, 1fr))",
        "36": "repeat(36, minmax(0, 1fr))",
        "37": "repeat(37, minmax(0, 1fr))",
        "38": "repeat(38, minmax(0, 1fr))",
        "39": "repeat(39, minmax(0, 1fr))",
        "40": "repeat(40, minmax(0, 1fr))",
        "41": "repeat(41, minmax(0, 1fr))",
        "42": "repeat(42, minmax(0, 1fr))",
        "43": "repeat(43, minmax(0, 1fr))",
        "44": "repeat(44, minmax(0, 1fr))",
        "45": "repeat(45, minmax(0, 1fr))",
        "46": "repeat(46, minmax(0, 1fr))",
        "47": "repeat(47, minmax(0, 1fr))",
        "48": "repeat(48, minmax(0, 1fr))",
        "49": "repeat(49, minmax(0, 1fr))",
        "50": "repeat(50, minmax(0, 1fr))",
        "51": "repeat(51, minmax(0, 1fr))",
        "52": "repeat(52, minmax(0, 1fr))",
        "53": "repeat(53, minmax(0, 1fr))",
        "54": "repeat(54, minmax(0, 1fr))",
        "55": "repeat(55, minmax(0, 1fr))",
        "56": "repeat(56, minmax(0, 1fr))",
        "57": "repeat(57, minmax(0, 1fr))",
        "58": "repeat(58, minmax(0, 1fr))",
        "59": "repeat(59, minmax(0, 1fr))",
        "60": "repeat(60, minmax(0, 1fr))",
        "61": "repeat(61, minmax(0, 1fr))",
        "62": "repeat(62, minmax(0, 1fr))",
        "63": "repeat(63, minmax(0, 1fr))",
        "64": "repeat(64, minmax(0, 1fr))",
        "65": "repeat(65, minmax(0, 1fr))",
        "66": "repeat(66, minmax(0, 1fr))",
        "67": "repeat(67, minmax(0, 1fr))",
        "68": "repeat(68, minmax(0, 1fr))",
        "69": "repeat(69, minmax(0, 1fr))",
        "70": "repeat(70, minmax(0, 1fr))",
        "71": "repeat(71, minmax(0, 1fr))",
        "72": "repeat(72, minmax(0, 1fr))",
        "73": "repeat(73, minmax(0, 1fr))",
        "74": "repeat(74, minmax(0, 1fr))",
        "75": "repeat(75, minmax(0, 1fr))",
        "76": "repeat(76, minmax(0, 1fr))",
        "77": "repeat(77, minmax(0, 1fr))",
        "78": "repeat(78, minmax(0, 1fr))",
        "79": "repeat(79, minmax(0, 1fr))",
        "80": "repeat(80, minmax(0, 1fr))",
        "81": "repeat(81, minmax(0, 1fr))",
        "82": "repeat(82, minmax(0, 1fr))",
        "83": "repeat(83, minmax(0, 1fr))",
        "84": "repeat(84, minmax(0, 1fr))",
        "85": "repeat(85, minmax(0, 1fr))",
        "86": "repeat(86, minmax(0, 1fr))",
        "87": "repeat(87, minmax(0, 1fr))",
        "88": "repeat(88, minmax(0, 1fr))",
        "89": "repeat(89, minmax(0, 1fr))",
        "90": "repeat(90, minmax(0, 1fr))",
        "91": "repeat(91, minmax(0, 1fr))",
        "92": "repeat(92, minmax(0, 1fr))",
        "93": "repeat(93, minmax(0, 1fr))",
        "94": "repeat(94, minmax(0, 1fr))",
        "95": "repeat(95, minmax(0, 1fr))",
        "96": "repeat(96, minmax(0, 1fr))",
        "97": "repeat(97, minmax(0, 1fr))",
        "98": "repeat(98, minmax(0, 1fr))",
        "99": "repeat(99, minmax(0, 1fr))",
        "100": "repeat(100, minmax(0, 1fr))",
        "101": "repeat(101, minmax(0, 1fr))",
        "102": "repeat(102, minmax(0, 1fr))",
        "103": "repeat(103, minmax(0, 1fr))",
        "104": "repeat(104, minmax(0, 1fr))",
        "105": "repeat(105, minmax(0, 1fr))",
        "106": "repeat(106, minmax(0, 1fr))",
        "107": "repeat(107, minmax(0, 1fr))",
        "108": "repeat(108, minmax(0, 1fr))",
        "109": "repeat(109, minmax(0, 1fr))",
        "110": "repeat(110, minmax(0, 1fr))",
        "111": "repeat(111, minmax(0, 1fr))",
        "112": "repeat(112, minmax(0, 1fr))",
        "113": "repeat(113, minmax(0, 1fr))",
        "114": "repeat(114, minmax(0, 1fr))",
        "115": "repeat(115, minmax(0, 1fr))",
        "116": "repeat(116, minmax(0, 1fr))",
        "117": "repeat(117, minmax(0, 1fr))",
        "118": "repeat(118, minmax(0, 1fr))",
        "119": "repeat(119, minmax(0, 1fr))",
        "120": "repeat(120, minmax(0, 1fr))",
      },
    },
  },
} satisfies Config;
