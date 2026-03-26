const inputCodigo = document.querySelector('#codigo');
const inputDescripcion = document.querySelector('#descripcion');
    document.addEventListener('DOMContentLoaded', () => {

        const form = document.querySelector('form');

        if (!form) return;

        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });

    });
    inputCodigo.addEventListener('change', async (e) => {
      const codigo = e.target.value.trim();
      
      if (codigo.length > 0) {
        try {
          inputDescripcion.value = 'Buscando producto...';
          
          // Ajusta esta URL a tu ruta real de la API
          const url = `${window.API_URL}/codigobyclaveCornejo/${codigo}`; 
          const respuesta = await fetch(url);
          //console.log(respuesta);
          if (!respuesta.ok) {
    // Si la respuesta no es 200-299, lanzamos un error manualmente para que caiga al catch
              throw new Error(`Error HTTP: ${respuesta.status} - ${respuesta.statusText}`);
          }
          const resultado = await respuesta.json();
          console.log('resultado:', resultado)
          // Como el JSON es un arreglo [ {...} ], verificamos que tenga algo
          if (resultado && resultado.length > 0) {
            const articulo = resultado[0]; // Tomamos el primer objeto
            
            inputDescripcion.value = articulo.NOMBRE;
            inputDescripcion.classList.remove('text-red-500', 'border-red-500');
            inputDescripcion.classList.add('text-gray-700', 'bg-green-50');
            
            // Opcional: Si tuvieras un input de existencia, podrías llenarlo así:
            // document.querySelector('#existencia').value = articulo.EXISTENCIA_A;

          } else {
            inputDescripcion.value = '❌ PRODUCTO NO REGISTRADO';
            inputDescripcion.classList.add('text-red-500', 'border-red-500');
            inputDescripcion.classList.remove('bg-green-50');
          }
        } catch (error) {
          console.error('Error:', error);
          inputDescripcion.value = '⚠️ Error de conexión con la base de datos';
        }
      }
    });