<script setup>
defineProps({ slug: { type: String, required: true } });
</script>

<template>
  <svg class="ticket-artwork" viewBox="0 0 240 240" fill="none" aria-hidden="true" focusable="false">
    <g v-if="slug === 'flash'">
      <path d="M121 121 1 14l70 111L0 161l91-5-45 83 86-73 104 67-57-103 61-54-93 11L158 0Z" fill="currentColor" opacity=".12" />
      <path d="m136 18-85 119h56l-18 85 103-132h-65Z" fill="#042f44" stroke="#042f44" stroke-width="13" stroke-linejoin="round" transform="translate(7 8)" />
      <path d="m136 18-85 119h56l-18 85 103-132h-65Z" fill="#fff27a" stroke="#fffdf0" stroke-width="4" stroke-linejoin="round" />
      <path d="m132 43-59 81h50l-17 58 59-80h-50Z" fill="#ffbc28" />
      <path d="m29 64 8 12m164 80 12 6M36 188l-9 10m161-163 7-12" stroke="#fff8ad" stroke-width="5" stroke-linecap="square" />
      <path d="m201 53 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#fff8ad" />
    </g>
    <g v-else-if="slug === 'fortune'">
      <circle cx="128" cy="129" r="91" stroke="#edd08b" stroke-width="1" opacity=".5" />
      <circle cx="128" cy="129" r="79" stroke="#edd08b" stroke-width="2" stroke-dasharray="2 6" />
      <circle cx="128" cy="129" r="65" fill="#073b32" stroke="#b98d3d" stroke-width="2" />
      <path d="m72 107 26 16 29-42 30 42 27-16-13 66H85Z" fill="#f5d889" stroke="#fff3c7" stroke-width="3" stroke-linejoin="round" />
      <path d="m84 126 14 9 29-39 30 39 14-9-7 32H91Z" fill="#bd8a37" />
      <path d="M88 173h80m-76 9h72" stroke="#f7dfa0" stroke-width="5" stroke-linecap="round" />
      <path d="m128 127 10 13-10 13-10-13Z" fill="#0f725b" stroke="#fff4cc" stroke-width="2" />
      <circle cx="72" cy="104" r="6" fill="#fff0bd" /><circle cx="128" cy="77" r="6" fill="#fff0bd" /><circle cx="184" cy="104" r="6" fill="#fff0bd" />
      <path d="M55 194c-19-23-23-50-17-77m13 59-15-5m11-14-13-8m12-9-10-11m164 65c19-23 23-50 17-77m-13 59 15-5m-11-14 13-8m-12-9 10-11" stroke="#cfac63" stroke-width="3" stroke-linecap="round" />
    </g>
    <g v-else-if="slug === 'jackpot'">
      <circle cx="127" cy="131" r="92" stroke="#ffca65" stroke-width="7" stroke-dasharray="1 14" stroke-linecap="round" opacity=".8" />
      <path d="M37 92h180v95H37z" fill="#4e1035" stroke="#f4bd62" stroke-width="5" transform="rotate(-9 127 139)" />
      <g transform="rotate(-9 127 139)">
        <path d="M46 101h50v77H46zm60 0h45v77h-45zm55 0h47v77h-47z" fill="#fff3d9" />
        <path d="M55 115h31l-19 48m46-48h30l-19 48m45-48h30l-19 48" stroke="#d52e51" stroke-width="11" stroke-linejoin="round" />
        <path d="M48 187h158" stroke="#aa632d" stroke-width="6" />
      </g>
      <path d="m67 50 4 12 13 4-13 4-4 13-4-13-13-4 13-4Zm119 2 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#ffe3a0" />
      <path d="m25 116-11-4m194 98 9 7M109 28l-2-12" stroke="#ffd882" stroke-width="4" />
    </g>
    <g v-else-if="slug === 'mystere'">
      <path d="M58 211V99a70 70 0 0 1 140 0v112Z" fill="#1a1854" stroke="#cba66c" stroke-width="2" />
      <path d="M69 203V99a59 59 0 0 1 118 0v104Z" stroke="#b7a1e4" opacity=".6" />
      <circle cx="128" cy="120" r="51" stroke="#b7a1e4" stroke-dasharray="1 7" stroke-width="2" />
      <path d="M153 73a46 46 0 1 0 14 80 40 40 0 0 1-14-80Z" fill="#e5c886" />
      <path d="M116 112c0-24 37-27 37-3 0 13-20 12-20 30" stroke="#fff4ce" stroke-width="8" stroke-linecap="round" />
      <circle cx="133" cy="156" r="5" fill="#fff4ce" />
      <path d="m38 79 3 10 10 3-10 3-3 10-3-10-10-3 10-3Zm164 70 4 12 12 4-12 4-4 12-4-12-12-4 12-4Zm-22-116 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#f4dfb1" />
      <circle cx="33" cy="172" r="2" fill="#e8d3fd" /><circle cx="215" cy="100" r="2" fill="#e8d3fd" /><circle cx="94" cy="18" r="2" fill="#e8d3fd" />
      <path d="M94 196h68m-57-8h46" stroke="#cba66c" stroke-width="2" />
    </g>
    <g v-else>
      <circle cx="128" cy="126" r="85" fill="#f5e6b9" stroke="#c6a85e" stroke-width="2" />
      <circle cx="128" cy="126" r="75" stroke="#158263" stroke-width="2" stroke-dasharray="4 5" />
      <path d="M86 73h85l-48 115h-29l43-89H86Z" fill="#044a39" transform="translate(5 5)" />
      <path d="M86 73h85l-48 115h-29l43-89H86Z" fill="#db412c" stroke="#fff7d7" stroke-width="3" />
      <g fill="#158263" stroke="#07553f" stroke-width="2">
        <path d="M59 149c-23-23-37 2-17 13-21 12-2 35 13 17 15 18 34-5 13-17 20-11 6-36-9-13Z" />
        <path d="m55 174 6 23" fill="none" stroke-width="4" />
        <path d="M193 54c-18-18-29 2-13 10-17 10-2 28 10 14 12 14 27-4 10-14 16-8 5-28-7-10Z" />
      </g>
      <path d="m40 59 3 8 8 3-8 3-3 8-3-8-8-3 8-3m157 116 3 8 8 3-8 3-3 8-3-8-8-3 8-3" fill="#f5d27f" />
    </g>
  </svg>
</template>
