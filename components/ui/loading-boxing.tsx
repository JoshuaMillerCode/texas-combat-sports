"use client"

import { motion } from "framer-motion"

interface LoadingBoxingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export default function LoadingBoxing({ text = "Loading...", size = "md" }: LoadingBoxingProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-8 pt-16">
      {/* Boxing Glove Animation */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} relative`}
          animate={{
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Boxing Glove SVG */}
          <svg
            width="800px"
            height="800px"
            viewBox="-10 -10 275 275"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
            className="w-full h-full"
          >
            <defs>
              <style>
                {`
                  .cls-3 {
                    fill: url(#linear-gradient-1);
                  }
                  .cls-4 {
                    fill: #dc2626;
                  }
                  .cls-5 {
                    fill: #991b1b;
                  }
                  .cls-7 {
                    fill: #7f1d1d;
                  }
                `}
              </style>
              <linearGradient id="linear-gradient-1" gradientUnits="userSpaceOnUse" x1="101.109" y1="136.594" x2="101.109" y2="-0.312">
                <stop offset="0" stopColor="#dc2626"/>
                <stop offset="1" stopColor="#991b1b"/>
              </linearGradient>
            </defs>
            <g id="boxing_glove">
              <motion.path
                d="M133.871,8.803 C133.871,8.803 156.544,29.945 156.544,29.945 C156.544,29.945 54.926,136.917 54.926,136.917 C54.926,136.917 50.538,132.825 50.538,132.825 C47.306,129.812 46.770,126.235 46.585,120.935 C46.435,116.636 41.734,65.086 84.700,19.011 C109.342,-7.414 122.562,-1.743 133.871,8.803 Z"
                id="path-1"
                className="cls-3"
                fillRule="evenodd"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.path
                d="M181.293,9.270 C181.293,9.270 243.458,67.240 243.458,67.240 C256.383,79.293 258.549,100.910 250.157,117.241 C219.101,177.676 135.711,203.312 135.711,203.312 C130.991,204.952 127.148,206.265 122.210,201.661 C122.210,201.661 50.538,134.825 50.538,134.825 C47.306,131.811 47.130,126.749 50.143,123.518 C50.143,123.518 136.066,10.849 136.066,10.849 C148.119,-2.076 168.368,-2.783 181.293,9.270 Z"
                id="path-2"
                className="cls-4"
                fillRule="evenodd"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              />
              <motion.path
                d="M55.463,137.553 C55.463,137.553 122.748,200.297 122.748,200.297 C125.979,203.310 126.156,208.372 123.142,211.603 C123.142,211.603 84.951,252.559 84.951,252.559 C81.937,255.791 76.875,255.967 73.644,252.954 C73.644,252.954 6.359,190.210 6.359,190.210 C3.128,187.197 2.951,182.135 5.964,178.903 C5.964,178.903 44.156,137.948 44.156,137.948 C47.169,134.716 52.232,134.539 55.463,137.553 Z"
                id="path-3"
                className="cls-5"
                fillRule="evenodd"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              <motion.path
                d="M35.479,133.590 C35.479,133.590 108.614,201.790 108.614,201.790 C111.845,204.803 112.022,209.866 109.009,213.097 C109.009,213.097 84.457,239.426 84.457,239.426 C81.444,242.657 76.382,242.834 73.150,239.820 C73.150,239.820 0.015,171.621 0.015,171.621 C0.015,171.621 35.479,133.590 35.479,133.590 Z"
                id="path-4"
                className="cls-4"
                fillRule="evenodd"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              />
              <motion.path
                d="M30.023,139.441 C30.023,139.441 99.501,204.231 99.501,204.231 C101.521,206.114 101.631,209.278 99.748,211.298 C99.748,211.298 82.016,230.313 82.016,230.313 C80.133,232.333 76.969,232.443 74.949,230.560 C74.949,230.560 5.471,165.770 5.471,165.770 C5.471,165.770 30.023,139.441 30.023,139.441 Z"
                id="path-5"
                className="cls-7"
                fillRule="evenodd"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </g>
          </svg>
        </motion.div>

        {/* Impact Effect */}
        <motion.div
          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full"
          animate={{
            scale: [0, 2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5
          }}
        />
        
        {/* Secondary Impact */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.7
          }}
        />
      </div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <h3 className={`font-bold text-white ${textSizes[size]} mb-2`}>
          {text}
        </h3>
        <div className="flex justify-center space-x-1">
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
          />
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
        </div>
      </motion.div>
    </div>
  )
} 