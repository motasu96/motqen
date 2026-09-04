import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/images/logo.png"
        alt="متقن - مقرأة القرآن الكريم"
        width={900}
        height={348}
        priority
        className="h-9 w-auto object-contain"
      />
    </span>
  );
}
