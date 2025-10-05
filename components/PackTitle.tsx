import Image from 'next/image';
export default function PackTitle({ titleImage, fallbackText }: { titleImage?: string; fallbackText: string }) {
  if (titleImage) return (<Image src={titleImage} alt={fallbackText} width={800} height={300} className="w-auto h-10 md:h-14" />);
  return <h3 className="font-display text-2xl md:text-4xl tracking-tight">{fallbackText}</h3>;
}
