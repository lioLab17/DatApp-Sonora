Q_LOGIN = """
    SELECT ruc_cliente, razon_social, contrasena 
    FROM cliente 
    WHERE ruc_cliente = :ruc
"""

Q_LISTA_CLIENTES = """
    SELECT ruc_cliente, razon_social 
    FROM cliente 
    ORDER BY razon_social ASC
"""

Q_UPDATE_FICHA = """
    UPDATE episodio 
    SET cadena_plugins = :plugins, 
        nivel_lufs = :lufs, 
        observaciones = :obs, 
        estado_episodio = :estado 
    WHERE id_episodio = :id
"""

Q_BI_TENDENCIA = """
    SELECT TO_CHAR(f.fecha_emision, 'Mon') as mes, SUM(df.cantidad * s.precio_unitario) as total
    FROM factura f
    JOIN detalle_factura df ON f.num_factura = df.num_factura
    JOIN servicio s ON df.cod_servicio = s.cod_servicio
    GROUP BY TO_CHAR(f.fecha_emision, 'Mon'), EXTRACT(MONTH FROM f.fecha_emision)
    ORDER BY EXTRACT(MONTH FROM f.fecha_emision)
"""

Q_BI_TOP_CLIENTES = """
    SELECT c.razon_social, SUM(df.cantidad * s.precio_unitario) as total_facturado
    FROM cliente c
    JOIN factura f ON c.ruc_cliente = f.ruc_cliente
    JOIN detalle_factura df ON f.num_factura = df.num_factura
    JOIN servicio s ON df.cod_servicio = s.cod_servicio
    GROUP BY c.razon_social
    ORDER BY total_facturado DESC
    LIMIT 5
"""

Q_BI_DISTRIBUCION = """
    SELECT s.descripcion_servicio, SUM(df.cantidad) as total_ventas
    FROM servicio s
    JOIN detalle_factura df ON s.cod_servicio = df.cod_servicio
    GROUP BY s.descripcion_servicio
    ORDER BY total_ventas DESC
"""

Q_BI_EQUIPO = """
    SELECT i.id_ingeniero, i.nombres, i.especialidad, i.seniority, i.software_top, i.rating_qc, i.velocidad_entrega,
        COUNT(e.id_episodio) as carga
    FROM ingeniero i
    LEFT JOIN episodio e ON i.id_ingeniero = e.id_ingeniero AND e.estado != 'Aprobado'
    GROUP BY i.id_ingeniero, i.nombres, i.especialidad, i.seniority, i.software_top, i.rating_qc, i.velocidad_entrega
"""