from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class NumberTextPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 10
    page_query_param = "page"

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "results": data,
                "next": self.page.next_page_number() if self.page.has_next() else None,
                "previous": self.page.previous_page_number()
                if self.page.has_previous()
                else None,
            }
        )

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "count": {
                    "type": "integer",
                    "example": 123,
                },
                "results": schema,
                "next": {
                    "type": "integer",
                    "nullable": True,
                    "example": "3",
                },
                "previous": {
                    "type": "integer",
                    "nullable": True,
                    "example": "5",
                },
            },
        }
