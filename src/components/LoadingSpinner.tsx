import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      {/* Anel do Spinner: posicionado de forma absoluta e girando */}
      <div className="absolute h-full w-full animate-spin rounded-full border-b-4 border-primus-blue" />

      {/* Logo: estática no centro, um pouco menor que o anel */}
      <div className="h-18 w-18">
        <Image
          src="/images/logo_primus.svg" // Caminho da sua logo em /public
          alt="Carregando..."
          width={72}
          height={72}
          style={{ objectFit: 'contain' }}
          priority // Opcional: Carrega a imagem do spinner com prioridade
        />
      </div>
    </div>
  );
}