document.addEventListener('DOMContentLoaded', () => {

    const inputCodigo = document.querySelector('#codigo')
    const inputDescripcion = document.querySelector('#descripcion')
    const form = document.querySelector('form')
    const btnGuardar = document.querySelector('#btnGuardar')

    if (!form) return

    // Evitar enviar formulario con Enter
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    })

    // Evitar múltiples envíos
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

    // Buscar artículo al cambiar código
    inputCodigo.addEventListener('change', async (e) => {

        const codigo = e.target.value.trim()

        if (!codigo) return

        try {

            inputDescripcion.value = 'Buscando producto...'

            const url =
                `${window.API_URL}/codigobyclaveCornejo/${codigo}`

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
                    `Error HTTP: ${respuesta.status} - ${respuesta.statusText}`
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