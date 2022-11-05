import { MemoryBookmarkRepo } from '../../pkg/data/memory/memory-bookmark-repo';
import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { Bookmark } from '../../pkg/event-store/bookmark';
import { removePersistedProps } from '../../pkg/event-store/util';
import { MemoryEmailServiceIntegration } from '../../pkg/integrations/email/memory-email-integration';
import { BookmarkRepo } from '../../pkg/process-manager/bookmark';
import { silentLogger } from '../../pkg/shared/logger';
import { ORDER_ID, products } from '../../pkg/test/test-data';
import { CheckoutEventConsumer } from '../consumer';

describe('CheckoutEventConsumer', () => {
    let consumer: CheckoutEventConsumer;
    let es: DomainEventStore;
    let bookmarkRepo: BookmarkRepo<Bookmark>;

    beforeEach(() => {
        es = new MemoryEventStore([
            {
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id, name: products[0].name },
            },
            {
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                payload: { itemId: products[1].id, name: products[1].name },
            },
            {
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 3,
                payload: {
                    totalPrice: products[0].price + products[1].price,
                },
            },
        ]);
        bookmarkRepo = new MemoryBookmarkRepo();
        consumer = new CheckoutEventConsumer(bookmarkRepo, es, es, new MemoryEmailServiceIntegration(silentLogger));
    });

    it('should process a checkout event correctly', async () => {
        const events = await es.loadEvents(await bookmarkRepo.get(), 10);
        await consumer.consumeEvents(events);

        const orderStream = removePersistedProps(await es.loadStream(ORDER_ID, 'ORDER_FLOW'));
        expect(orderStream[orderStream.length - 1]).toEqual({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_CONFIRMED',
            version: 4,
            payload: {},
        });
    });
});
