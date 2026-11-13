#!/usr/bin/env bash
# Configura el SMTP de Gmail en Supabase (mails de confirmación y de recuperar contraseña).
# La cuenta de Gmail y su contraseña de aplicación NO viven en el repo: se piden por la terminal (la contraseña
# no se muestra al escribirla ni al pegarla) y existen solo mientras corre este script. Hace falta `supabase login`.
#   Uso:  SMTP_USER=cuenta@gmail.com bash supabase/configurar-smtp.sh      (si no ponés SMTP_USER, te lo pregunta)
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${SMTP_USER:-}" ]; then read -rp 'Cuenta de Gmail desde la que se envía: ' SMTP_USER; fi
printf 'Contraseña de aplicación de %s (no se ve al escribir ni al pegar): ' "$SMTP_USER"
read -rs SMTP_PASS; echo
SMTP_PASS="${SMTP_PASS// /}"   # Google la muestra con espacios; sin espacios es la misma
[ ${#SMTP_PASS} -eq 16 ] || { echo "Ojo: una contraseña de aplicación tiene 16 letras (esta tiene ${#SMTP_PASS}). Probá de nuevo."; exit 1; }
export SMTP_USER SMTP_PASS
supabase config push --yes
unset SMTP_PASS
echo "Listo: SMTP configurado."
