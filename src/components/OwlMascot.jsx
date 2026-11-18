import React from 'react';

/**
 * Linh vật Cú Thông Thái siêu dễ thương dành cho học sinh lớp 5
 * Hỗ trợ các trạng thái:
 * - 'welcome': Vẫy cánh chào mừng, đeo kính tròn thông thái
 * - 'thinking': Đang đọc bài, mắt chớp chớp, kính lúp di chuyển
 * - 'celebrate': Vui sướng, sao lấp lánh, cầm bút lông vàng
 * - 'teacher': Đeo nơ học giả, nghiêm túc nhưng hiền từ
 */
export default function OwlMascot({ state = 'welcome', size = 130, className = '' }) {
  return (
    <div
      className={`owl-mascot-wrapper ${state} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Linh vật Cú Thông Thái"
    >
      <svg
        viewBox="0 0 160 160"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="owl-svg"
      >
        <defs>
          {/* Đổ bóng mềm */}
          <filter id="soft-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4a3e3d" floodOpacity="0.15" />
          </filter>
          {/* Gradient màu thân cú */}
          <linearGradient id="owl-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#6D4C41" />
          </linearGradient>
          {/* Gradient bụng cú */}
          <linearGradient id="owl-belly-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="100%" stopColor="#FFE082" />
          </linearGradient>
          {/* Gradient mũ cử nhân */}
          <linearGradient id="cap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3949AB" />
            <stop offset="100%" stopColor="#1A237E" />
          </linearGradient>
        </defs>

        {/* Vầng sáng nền phía sau (khi ăn mừng) */}
        {state === 'celebrate' && (
          <g className="sparkles">
            <circle cx="20" cy="30" r="4" fill="#FFD54F" />
            <circle cx="140" cy="35" r="5" fill="#FFCA28" />
            <circle cx="145" cy="110" r="3.5" fill="#FFB300" />
            <circle cx="15" cy="115" r="4" fill="#FFD54F" />
            <polygon points="25,45 28,52 35,55 28,58 25,65 22,58 15,55 22,52" fill="#FFC107" />
            <polygon points="135,65 137,70 143,72 137,74 135,79 133,74 127,72 133,70" fill="#FFC107" />
          </g>
        )}

        {/* Đôi chân cú */}
        <g id="owl-feet">
          <ellipse cx="65" cy="146" rx="9" ry="5" fill="#FFA000" />
          <ellipse cx="95" cy="146" rx="9" ry="5" fill="#FFA000" />
        </g>

        {/* Đôi tai / sừng lông cú */}
        <g id="owl-ears">
          <path d="M 46 45 L 30 18 L 60 35 Z" fill="#6D4C41" />
          <path d="M 114 45 L 130 18 L 100 35 Z" fill="#6D4C41" />
          <path d="M 48 42 L 36 24 L 58 36 Z" fill="#BCAAA4" opacity="0.6" />
          <path d="M 112 42 L 124 24 L 102 36 Z" fill="#BCAAA4" opacity="0.6" />
        </g>

        {/* Thân cú mập tròn */}
        <ellipse
          cx="80"
          cy="90"
          rx="52"
          ry="55"
          fill="url(#owl-body-grad)"
          filter="url(#soft-shadow)"
        />

        {/* Bụng cú màu kem mềm */}
        <ellipse cx="80" cy="100" rx="35" ry="38" fill="url(#owl-belly-grad)" />

        {/* Đốm lông hình chữ V trên ngực */}
        <g stroke="#D7CCC8" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 72 82 L 80 88 L 88 82" />
          <path d="M 66 96 L 74 102 L 82 96" />
          <path d="M 78 96 L 86 102 L 94 96" />
          <path d="M 72 110 L 80 116 L 88 110" />
        </g>

        {/* Cánh trái */}
        <g className={`wing-left ${state === 'welcome' || state === 'celebrate' ? 'waving-wing' : ''}`}>
          <path
            d="M 32 75 C 18 85, 18 112, 36 122 C 38 108, 40 92, 42 78 Z"
            fill="#5D4037"
          />
        </g>

        {/* Cánh phải */}
        <g className={`wing-right ${state === 'celebrate' ? 'waving-wing-right' : ''}`}>
          <path
            d="M 128 75 C 142 85, 142 112, 124 122 C 122 108, 120 92, 118 78 Z"
            fill="#5D4037"
          />
        </g>

        {/* Đôi mắt to tròn long lanh */}
        <g id="owl-eyes">
          {/* Quầng mắt trắng */}
          <circle cx="58" cy="68" r="22" fill="#FFFFFF" stroke="#EFEBE9" strokeWidth="2" />
          <circle cx="102" cy="68" r="22" fill="#FFFFFF" stroke="#EFEBE9" strokeWidth="2" />

          {/* Tròng mắt màu nâu trà hoặc hổ phách */}
          <circle cx="61" cy="68" r="13" fill="#3E2723" className="pupil" />
          <circle cx="99" cy="68" r="13" fill="#3E2723" className="pupil" />

          {/* Đốm sáng trong mắt */}
          <circle cx="58" cy="64" r="5" fill="#FFFFFF" />
          <circle cx="64" cy="71" r="2" fill="#FFFFFF" />
          <circle cx="96" cy="64" r="5" fill="#FFFFFF" />
          <circle cx="102" cy="71" r="2" fill="#FFFFFF" />

          {/* Mí mắt cong vui vẻ khi ăn mừng */}
          {state === 'celebrate' && (
            <>
              <path d="M 45 64 Q 58 55 71 64" stroke="#4E342E" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 89 64 Q 102 55 115 64" stroke="#4E342E" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* Kính tròn tri thức màu vàng đồng */}
        <g id="glasses" stroke="#FFA000" strokeWidth="3.5" fill="none">
          <circle cx="58" cy="68" r="22.5" />
          <circle cx="102" cy="68" r="22.5" />
          <path d="M 80.5 68 L 79.5 68" />
          <path d="M 77 68 Q 80 64 83 68" />
        </g>

        {/* Mỏ cú màu cam */}
        <polygon points="80,74 74,84 86,84" fill="#FF8F00" />
        <polygon points="80,87 75,83 85,83" fill="#FFA000" />

        {/* Hai má hồng phúng phính */}
        <ellipse cx="44" cy="84" rx="7" ry="4.5" fill="#FF8A80" opacity="0.6" />
        <ellipse cx="116" cy="84" rx="7" ry="4.5" fill="#FF8A80" opacity="0.6" />

        {/* Mũ cử nhân nhí trên đầu */}
        <g id="grad-cap" transform="translate(80, 26) scale(0.95)">
          <polygon points="0,-16 42,-5 0,6 -42,-5" fill="url(#cap-grad)" />
          <path d="M -22,-3 L -22,8 C -22,14 22,14 22,8 L 22,-3 Z" fill="#1A237E" />
          {/* Nút mũ & dải tua rua vàng */}
          <circle cx="0" cy="-5" r="3" fill="#FFD54F" />
          <path d="M 0,-5 Q 24,-2 28,12" stroke="#FFD54F" strokeWidth="2" fill="none" />
          <rect x="25" y="12" width="6" height="8" rx="2" fill="#FFC107" />
        </g>

        {/* Phụ kiện trạng thái đặc biệt */}
        {state === 'thinking' && (
          /* Kính lúp thông thái soi bài */
          <g className="magnifier" transform="translate(108, 90)">
            <circle cx="12" cy="12" r="14" fill="#E1F5FE" stroke="#0288D1" strokeWidth="3" opacity="0.85" />
            <line x1="22" y1="22" x2="36" y2="36" stroke="#455A64" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 5 10 A 8 8 0 0 1 14 5" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {state === 'celebrate' && (
          /* Bút lông vàng lấp lánh */
          <g transform="translate(115, 80) rotate(-25)">
            <path d="M 0 0 Q 8 -18 18 -26 Q 14 -10 10 5 Z" fill="#FFD54F" />
            <line x1="0" y1="0" x2="16" y2="-24" stroke="#FFA000" strokeWidth="1.5" />
          </g>
        )}

        {state === 'teacher' && (
          /* Nơ cổ đỏ trang nhã */
          <g transform="translate(80, 118)">
            <polygon points="-12,-6 -12,6 0,0" fill="#E53935" />
            <polygon points="12,-6 12,6 0,0" fill="#E53935" />
            <circle cx="0" cy="0" r="3.5" fill="#B71C1C" />
          </g>
        )}
      </svg>
    </div>
  );
}
