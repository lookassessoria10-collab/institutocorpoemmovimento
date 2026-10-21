# 9. Exportar uma gravação

## Gravação integrada

1. Barra inferior: ligue **Microfone** e/ou **Webcam** (o navegador pede
   permissão explícita; recusar mostra a mensagem e mantém o estúdio
   funcionando).
2. Escolha a contagem regressiva (0, 3 ou 5 s) e o formato do arquivo — a
   lista mostra **apenas** os formatos que este navegador realmente grava
   (`MediaRecorder.isTypeSupported`). MP4/H.264 aparece primeiro quando existe.
3. **Gravar** (ou tecla R). Durante a gravação: indicador vermelho e
   cronômetro. Manipule o modelo normalmente.
4. **Encerrar gravação** → prévia com nome do arquivo, formato real, duração
   e tamanho → **Baixar vídeo** ou **Descartar**.

Como funciona: a cada quadro, o estúdio desenha num canvas de composição na
resolução de saída (1080×1920, 1920×1080 ou 1080×1080) o fundo, o canvas 3D,
a webcam, as anotações marcadas "No vídeo", título, legenda, aviso e
assinatura — a mesma função que desenha a prévia na tela. Esse canvas é
capturado (`captureStream(30)`) junto com o áudio do microfone. Nada é
enviado a servidores; câmera, microfone e o arquivo temporário são liberados
ao encerrar ou sair do estúdio.

## O que foi testado (21/10/2026)

| Navegador | Resultado |
| --- | --- |
| Chromium 152 (navegador do app Claude, Windows 11) | Gravação de 4 s no estúdio: **MP4 `avc1.640028`**, 1080×1920, 3,93 s, quadros com a anatomia conferidos. Teste isolado: MP4 (`avc1.640015`), WebM VP9 e VP8 também gravam. |
| Chromium 152 — microfone/webcam | Bloqueados pelo navegador de teste: só o caminho de **permissão negada** foi testado (mensagem exibida, estúdio segue funcionando). Captura real de áudio e webcam **não testada**. |
| Chrome/Edge para desktop, Safari, Firefox | **Não testados.** Esperado: Chrome/Edge recentes gravam MP4 e WebM; Safari grava MP4; Firefox grava WebM. Confirme antes de depender deles. |

Observação de teste: se a aba do estúdio ficar em segundo plano, o navegador
pausa a renderização e o vídeo congela nesse trecho. Grave com o estúdio
visível.

## WebM → MP4 (quando o navegador só gravar WebM)

O arquivo **nunca** é renomeado como MP4. Converta explicitamente, por
exemplo com o FFmpeg instalado no computador:

```bash
ffmpeg -i corpo-em-movimento_cena.webm -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart corpo-em-movimento_cena.mp4
```

## Alternativa: OBS Studio

Se a gravação integrada não estiver disponível ou se for preferível gravar
em alta taxa de bits:

1. Abra o estúdio, escolha formato/modo/cena e entre no **modo apresentação** (P).
2. No OBS: Fontes › **Captura de janela** (navegador) — ou Captura de tela.
3. Ajuste a tela do OBS para a resolução do formato (ex.: 1080×1920) e recorte
   a fonte ao quadro do vídeo (Alt + arrastar as bordas).
4. Use o microfone pelo próprio OBS (Fontes › Captura de entrada de áudio).

## Créditos no post

Inclua na descrição: "Modelos 3D: BodyParts3D, © DBCLS, CC BY 4.0 (modificado)".
