import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {Box, IconButton, Slider, Tooltip, Typography} from '@mui/material'
import {Delete as ClearIcon} from '@mui/icons-material'
import {GAME_COLORS, GAME_LAYOUT} from '../theme/gameTheme'

const COLORS = [
    '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308',
    '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#78716C',
]

const GameCanvas = forwardRef(({
    isDrawer,
    onDraw,
    onClear,
    disabled,
    timerDanger,
}, ref) => {
    const canvasRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [brushColor, setBrushColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(4)
    const [currentStroke, setCurrentStroke] = useState([])

    // 외부에서 캔버스 조작 가능하도록 ref 노출
    useImperativeHandle(ref, () => ({
        clear: () => clearCanvas(false),
        drawStroke: (strokeData) => drawRemoteStroke(strokeData),
        getImageData: () => {
            const canvas = canvasRef.current
            return canvas?.toDataURL()
        },
    }))

    // 캔버스 초기화
    const clearCanvas = useCallback((sendToOthers = true) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (sendToOthers && onClear) {
            onClear()
        }
    }, [onClear])

    // 원격 스트로크 그리기
    const drawRemoteStroke = useCallback((strokeData) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let data = strokeData

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch (e) {
                console.error('Failed to parse stroke data:', e)
                return
            }
        }

        if (!Array.isArray(data)) return

        data.forEach((point) => {
            if (point.type === 'start') {
                ctx.beginPath()
                ctx.moveTo(point.x, point.y)
                ctx.lineWidth = point.width || 4
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                ctx.strokeStyle = point.color || '#000000'
            } else if (point.type === 'move') {
                ctx.lineTo(point.x, point.y)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(point.x, point.y)
            } else if (point.type === 'end') {
                ctx.beginPath()
            }
        })
    }, [])

    // 캔버스 초기화 (마운트 시)
    useEffect(() => {
        clearCanvas(false)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // 그리기 시작
    const startDrawing = (e) => {
        if (!isDrawer || disabled) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        setIsDrawing(true)
        setCurrentStroke([{ x, y, type: 'start', color: brushColor, width: brushSize }])

        const ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = brushColor
    }

    // 그리기
    const draw = (e) => {
        if (!isDrawing || !isDrawer || disabled) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)

        setCurrentStroke(prev => [...prev, { x, y, type: 'move' }])
    }

    // 그리기 종료
    const stopDrawing = () => {
        if (!isDrawing) return

        setIsDrawing(false)

        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.beginPath()
        }

        // 스트로크 전송
        if (currentStroke.length > 0 && onDraw) {
            const strokeData = [...currentStroke, { type: 'end' }]
            onDraw(JSON.stringify(strokeData))
        }

        setCurrentStroke([])
    }

    // 터치 이벤트 핸들러
    const handleTouchStart = (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY })
    }

    const handleTouchMove = (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        draw({ clientX: touch.clientX, clientY: touch.clientY })
    }

    const handleTouchEnd = (e) => {
        e.preventDefault()
        stopDrawing()
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 캔버스 */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    bgcolor: '#F1F5F9',
                }}
            >
                <Box
                    sx={{
                        border: '2px solid',
                        borderColor: timerDanger
                            ? GAME_COLORS.canvas.borderDanger
                            : GAME_COLORS.canvas.borderActive,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: timerDanger
                            ? `0 0 12px ${GAME_COLORS.canvas.borderDanger}40`
                            : `0 2px 12px rgba(0,0,0,0.1)`,
                        transition: 'all 0.3s ease',
                        animation: timerDanger ? 'pulse 1s ease-in-out infinite' : 'none',
                        '@keyframes pulse': {
                            '0%, 100%': { borderColor: GAME_COLORS.canvas.borderDanger },
                            '50%': { borderColor: '#FCA5A5' },
                        },
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={GAME_LAYOUT.canvas.width}
                        height={GAME_LAYOUT.canvas.height}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                            display: 'block',
                            cursor: isDrawer && !disabled ? 'crosshair' : 'default',
                            touchAction: 'none',
                            maxWidth: '100%',
                            height: 'auto',
                        }}
                    />
                </Box>
            </Box>

            {/* 그리기 도구 (출제자만) - 컴팩트 */}
            {isDrawer && (
                <Box
                    sx={{
                        p: 0.75,
                        bgcolor: 'white',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                    }}
                >
                    {/* 색상 팔레트 */}
                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                        {COLORS.map((color) => (
                            <Tooltip key={color} title={color === '#FFFFFF' ? '지우개' : ''}>
                                <Box
                                    onClick={() => setBrushColor(color)}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        bgcolor: color,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        border: brushColor === color
                                            ? '2px solid #1F2937'
                                            : '1px solid #E5E7EB',
                                        transition: 'transform 0.15s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                        },
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Box>

                    {/* 브러시 크기 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 100 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                            굵기
                        </Typography>
                        <Slider
                            value={brushSize}
                            onChange={(e, value) => setBrushSize(value)}
                            min={2}
                            max={20}
                            size="small"
                            sx={{
                                color: GAME_COLORS.primary,
                                width: 60,
                                '& .MuiSlider-thumb': { width: 12, height: 12 },
                            }}
                        />
                    </Box>

                    {/* 지우기 버튼 */}
                    <Tooltip title="전체 지우기">
                        <IconButton
                            onClick={() => clearCanvas(true)}
                            size="small"
                            sx={{
                                bgcolor: '#FEE2E2',
                                color: '#EF4444',
                                '&:hover': { bgcolor: '#FECACA' },
                                p: 0.5,
                            }}
                        >
                            <ClearIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    )
})

GameCanvas.displayName = 'GameCanvas'

export default GameCanvas
