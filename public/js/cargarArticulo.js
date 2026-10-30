document.addEventListener('DOMContentLoaded', () => {

    const inputCodigo = document.querySelector('#codigo')
    const inputCantidad = document.querySelector('#cantidad')
    const inputDescripcion = document.querySelector('#descripcion')
    const form = document.querySelector('form')
    const btnGuardar = document.querySelector('#btnGuardar')

    if (!form) return

    // 1. Evitar que presionar Enter en el campo de Código envíe el formulario y en su lugar pasar a Cantidad
    if (inputCodigo && inputCantidad) {
        inputCodigo.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Frena totalmente el envío por defecto
                inputCantidad.focus();  // Mueve el cursor a la cantidad
                inputCantidad.select(); // Selecciona el texto (el '0')
            }
        });
    }

    // 2. Evitar múltiples envíos al hacer clic en el botón de guardar
    let enviando = false

    form.addEventListener('submit', (e) => {
        if (enviando) {
            e.preventDefault()
            return
        }

        enviando = true

        btnGuardar.disabled = true
        btnGuardar.textContent = 'Guardando...'

        btnGuardar.classList.add(
            'opacity-50',
            'cursor-not-allowed'
        )
    })

    // 3. Buscar artículo al cambiar código
    inputCodigo.addEventListener('change', async (e) => {

        const codigo = e.target.value.trim()

        if (!codigo) return

        try {

            inputDescripcion.value = 'Buscando producto...'

            const url =
                `${window.API_URL}/apicornejo/codigobybarcode/${codigo}`

            const respuesta = await fetch(url)

            console.log(respuesta)

            if (respuesta.status === 404) {

                inputDescripcion.value =
                    '❌ PRODUCTO NO REGISTRADO'

                inputDescripcion.classList.add(
                    'text-red-500',
                    'border-red-500'
                )

                inputDescripcion.classList.remove(
                    'bg-green-50'
                )

                return
            }

            if (!respuesta.ok) {
                throw new Error(
                    `Error HTTP: ${respuesta.status} ${respuesta.statusText}`
                )
            }

            const resultado = await respuesta.json()

            console.log('resultado:', resultado)

            if (
                Array.isArray(resultado) &&
                resultado.length > 0
            ) {

                const articulo = resultado[0]

                inputDescripcion.value = articulo.NOMBRE

                inputDescripcion.classList.remove(
                    'text-red-500',
                    'border-red-500'
                )

                inputDescripcion.classList.add(
                    'text-gray-700',
                    'bg-green-50'
                )

            } else {

                inputDescripcion.value =
                    '❌ PRODUCTO NO REGISTRADO'
            }

        } catch (error) {

            console.error('Error:', error)

            inputDescripcion.value =
                '⚠️ Error de conexión con la base de datos'
        }
    })
})